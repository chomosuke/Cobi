import request from 'supertest';
import { getToken } from '../../src/auth/getToken'
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';
import { PrismaClient } from '../../prisma';

jest.mock('../../src/auth/getToken');
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

type FindUnique = PrismaClient['user']['findUnique'];
const mockContext = {
    authUrl: 'https://somehost',
    prisma: {
        user: {
            findUnique: jest.fn<Promise<{ id: number } | null>, Parameters<FindUnique>>(),
        },
    },
    debug: true,
};

const payload = { username: 'username', password: 'somehash' };
const authToken = 'authToken';

describe('login', () => {
    beforeEach(() => {
        mockContext.prisma.user.findUnique.mockReset();
        mockGetToken.mockReset();
    });

    it('should return token if getToken returns token', async () => {
        const userId = 23;
        mockContext.prisma.user.findUnique.mockResolvedValue({ id: userId });
        mockGetToken.mockResolvedValue(authToken);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/login')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(authToken);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalledWith({
            select: {
                id: true,
            },
            where: {
                username: payload.username,
            },
        });
        expect(mockGetToken).toHaveBeenCalledWith(
            mockContext.authUrl,
            { userId, password: payload.password },
        );
    });

    it('should return 401 if user not found', async() => {
        mockContext.prisma.user.findUnique.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/login')
            .send(payload);
        expect(res.statusCode).toBe(401);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalled();
        expect(mockGetToken).not.toHaveBeenCalled();
    });

    it('should return 401 if getToken return null', async () => {
        const userId = 23;
        mockContext.prisma.user.findUnique.mockResolvedValue({ id: userId });
        mockGetToken.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/login')
            .send(payload);
        expect(res.statusCode).toBe(401);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalled();
        expect(mockGetToken).toHaveBeenCalled();
    });
});
