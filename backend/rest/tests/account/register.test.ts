import request from 'supertest';
import fetch from 'node-fetch';
import { PrismaClient } from '../../prisma';
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';
import { PrismaClientKnownRequestError } from '../../prisma/runtime';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

type Create = PrismaClient['user']['create'];
const mockContext = {
    authUrl: 'https://somehost',
    prisma: {
        user: {
            create: jest.fn<ReturnType<Create>, Parameters<Create>>(),
        },
    },
    debug: true,
};

const payload = { username: 'username', password: 'somehash' };
const authToken = 'authToken';

describe('register', () => {
    beforeEach(() => {
        mockContext.prisma.user.create.mockReset();
        mockFetch.mockReset();
    });

    it('should return token if everything succeed', async () => {
        mockFetch.mockResolvedValue({
            text: () => Promise.resolve(authToken),
            status: 200,
        } as Awaited<ReturnType<typeof fetch>>);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/register')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(authToken);
        expect(mockFetch).toHaveBeenCalledWith(`${mockContext.authUrl}/parse`, {
            method: 'post',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
        });
        expect(mockContext.prisma.user.create).toHaveBeenCalledWith({
            data: {
                ...payload,
            },
        });
    });

    it('should return 409 if conflicted', async () => {
        mockContext.prisma.user.create.mockRejectedValue(
            new PrismaClientKnownRequestError('test error', 'P2002', 'random version'),
        );
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/register')
            .send(payload);
        expect(res.statusCode).toBe(409);
    });

    it('should throw if auth service doesn\'t return 200', async () => {
        mockFetch.mockResolvedValue({
            text: () => Promise.resolve(authToken),
            status: 401,
        } as Awaited<ReturnType<typeof fetch>>);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/register')
            .send(payload);
        expect(res.statusCode).toBe(500);
    });

    it('should throw if prisma client throw error that\'s not unique index error', async () => {
        mockContext.prisma.user.create.mockRejectedValue(
            new PrismaClientKnownRequestError('test error', 'P2202', 'random version'),
        );
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/register')
            .send(payload);
        expect(res.statusCode).toBe(500);
    });
});
