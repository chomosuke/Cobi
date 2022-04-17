import request from 'supertest';
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';
import { PrismaClient } from '../../prisma';
import { authenticate } from '../../src/auth/authenticate';
import { mockAuthenticate } from '../auth/mockAuthenticate';

jest.mock('../../src/auth/authenticate');
const authenticateMock = authenticate as jest.MockedFunction<typeof authenticate>;
const userId = 123;
authenticateMock.mockImplementation(mockAuthenticate(userId));

type FindUnique = PrismaClient['users']['findUnique'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        users: {
            findUnique: jest.fn<Promise<{ username: string } | null>, Parameters<FindUnique>>(),
        },
    },
    debug: true,
};

describe('account get', () => {
    beforeEach(() => {
        mockContext.prisma.users.findUnique.mockReset();
        authenticateMock.mockClear();
    });

    it('should return account info', async () => {
        const username = 'username';
        mockContext.prisma.users.findUnique.mockResolvedValue({ username });
        const res = await request(constructApp(mockContext as unknown as Context))
            .get('/api/account')
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ username });
        expect(mockContext.prisma.users.findUnique).toHaveBeenCalledWith({
            where: { id: userId },
            select: { username: true },
            rejectOnNotFound: true,
        });
        expect(authenticateMock).toHaveBeenCalled();
    });
});
