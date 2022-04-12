/* eslint-disable no-restricted-syntax */
import request from 'supertest';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '../prisma';
import { Context } from '../src/context';
import { constructApp } from '../src/constructApp';

jest.mock('jsonwebtoken');
const jwtSign = jwt.sign as jest.MockedFunction<
(
    payload: string | Buffer | object,
    secretOrPrivateKey: Secret,
    options?: SignOptions,
) => string
>;

type FindFirst = PrismaClient['users']['findFirst'];
const mockContext = {
    secret: 'secret',
    prisma: {
        users: {
            findFirst: jest.fn<ReturnType<FindFirst>, Parameters<FindFirst>>(),
        },
    },
};

const payload = { username: 'username', password: 'somehash' };

describe('parse', () => {
    beforeEach(() => {
        mockContext.prisma.users.findFirst.mockReset();
        jwtSign.mockReset();
    });

    it('should return 401 if no user found with username & password', async () => {
        mockContext.prisma.users.findFirst.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/parse')
            .send(payload);
        expect(res.statusCode).toBe(401);
        expect(mockContext.prisma.users.findFirst).toHaveBeenCalledWith({ where: payload });
    });

    it('should return correct jwt if userId found', async () => {
        const userId = 123;
        mockContext.prisma.users.findFirst.mockResolvedValue({
            ...payload,
            id: userId,
        });
        const token = 'jwt';
        jwtSign.mockReturnValue(token);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/parse')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(token);
        expect(mockContext.prisma.users.findFirst).toHaveBeenCalledWith({ where: payload });
        expect(jwtSign).toHaveBeenCalledWith({ userId: userId.toString() }, mockContext.secret);
    });
});
