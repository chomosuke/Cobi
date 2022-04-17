import request from 'supertest';
import fetch from 'node-fetch';
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockContext = {
    authUrl: 'https://somehost',
    prisma: undefined,
    debug: true,
};

const payload = { username: 'username', password: 'somehash' };
const authToken = 'authToken';

describe('login', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should return token if auth service returns 200', async () => {
        mockFetch.mockResolvedValue({
            text: () => Promise.resolve(authToken),
            status: 200,
        } as Awaited<ReturnType<typeof fetch>>);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/login')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(authToken);
        expect(mockFetch).toHaveBeenCalledWith(`${mockContext.authUrl}/parse`, {
            method: 'post',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
        });
    });

    it('should return 401 if auth service returns 401', async () => {
        mockFetch.mockResolvedValue({
            text: async () => { throw new Error('this should not be read'); },
            status: 401,
        } as unknown as Awaited<ReturnType<typeof fetch>>);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/login')
            .send(payload);
        expect(res.statusCode).toBe(401);
    });

    it('should throw error if auth service return something other than 200 or 401', async () => {
        mockFetch.mockResolvedValue({
            text: async () => { throw new Error('this should not be read'); },
            status: 500,
        } as unknown as Awaited<ReturnType<typeof fetch>>);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/login')
            .send(payload);
        expect(res.statusCode).toBe(500);
    });
});
