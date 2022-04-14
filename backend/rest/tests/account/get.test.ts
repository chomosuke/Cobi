/* eslint-disable no-restricted-syntax */
import request from 'supertest';
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';
import { PrismaClient } from '../../prisma';
import { authenticate } from '../../src/auth/authenticate';

jest.mock('../../src/auth/authenticate');
const authenticateMock = authenticate as jest.MockedFunction<typeof authenticate>;

type FindUnique = PrismaClient['users']['findUnique'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        users: {
            findUnique: jest.fn<Promise<{ username: string } | null>, Parameters<FindUnique>>(),
        },
    },
};

describe('account get', () => {
    beforeEach(() => {
        mockContext.prisma.users.findUnique.mockReset();
        authenticateMock.mockReset();
    });

    it('should return account info', async () => {
        const userId = 123;
        authenticateMock.mockImplementation((_context: Context) => [(req, _res, next) => {
            req.userId = userId;
            next();
        }]);
        const username = 'username';
        mockContext.prisma.users.findUnique.mockResolvedValue({ username });
        const res = await request(constructApp(mockContext as unknown as Context))
            .get('/api/account')
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ username });
        expect(mockContext.prisma.users.findUnique).toHaveBeenCalledWith({
            where: { id: userId },
            select: { username: true },
        });
        expect(authenticateMock).toHaveBeenCalled();
    });
});
