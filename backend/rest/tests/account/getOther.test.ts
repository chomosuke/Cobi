import request from 'supertest';
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';
import { PrismaClient } from '../../prisma';

type FindUnique = PrismaClient['user']['findUnique'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        user: {
            findUnique: jest.fn<Promise<{ username: string } | null>, Parameters<FindUnique>>(),
        },
    },
    debug: true,
};

describe('get another user\'s account', () => {
    beforeEach(() => {
        mockContext.prisma.user.findUnique.mockReset();
    });

    it('should respond with account info if user is found', async () => {
        const username = 'username';
        const userId = '123';
        mockContext.prisma.user.findUnique.mockResolvedValue({ username });
        const res = await request(constructApp(mockContext as unknown as Context))
            .get(`/api/account/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ username });
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalledWith({
            where: {
                id: parseInt(userId, 10),
            },
            select: {
                username: true,
            },
        });
    });

    it('should respond with 404 if userId is not a number', async () => {
        const userId = 'userId';
        const res = await request(constructApp(mockContext as unknown as Context))
            .get(`/api/account/${userId}`);
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should respond with 404 if userId is not found', async () => {
        const userId = '123';
        mockContext.prisma.user.findUnique.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .get(`/api/account/${userId}`);
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalled();
    });
});
