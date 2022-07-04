import request from 'supertest';
import { addUser } from '../../src/auth/addUser';
import { PrismaClient } from '../../prisma';
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';
import { getToken } from '../../src/auth/getToken';

jest.mock('../../src/auth/addUser');
const mockAddUser = addUser as jest.MockedFunction<typeof addUser>;

jest.mock('../../src/auth/getToken');
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

type Create = PrismaClient['user']['create'];
type FindUnique = PrismaClient['user']['findUnique'];
const mockContext = {
    authUrl: 'https://somehost',
    prisma: {
        user: {
            create: jest.fn<ReturnType<Create>, Parameters<Create>>(),
            findUnique: jest.fn<Promise<{ id: number } | null>, Parameters<FindUnique>>(),
        },
    },
    debug: true,
};

const payload = { username: 'username', password: 'somehash' };
const authToken = 'authToken';

describe('register', () => {
    beforeEach(() => {
        mockContext.prisma.user.create.mockReset();
        mockContext.prisma.user.findUnique.mockReset();
        mockAddUser.mockReset();
        mockGetToken.mockReset();
    });

    it('should return token if everything succeed', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue(null);
        const userId = 12;
        mockAddUser.mockResolvedValue(userId);
        mockGetToken.mockResolvedValue(authToken);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/register')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(authToken);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalledWith({
            select: { id: true },
            where: { username: payload.username },
        });
        expect(mockAddUser).toHaveBeenCalledTimes(1);
        expect(mockAddUser).toHaveBeenCalledWith(
            mockContext.authUrl,
            { password: payload.password },
        );
        expect(mockContext.prisma.user.create).toHaveBeenCalledTimes(1);
        expect(mockContext.prisma.user.create).toHaveBeenCalledWith({
            data: {
                id: userId,
                username: payload.username,
            },
        });
        expect(mockGetToken).toHaveBeenCalledWith(
            mockContext.authUrl,
            { userId, password: payload.password },
        );
    });

    it('should return 409 if conflicted', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue({ id: 1 });
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/register')
            .send(payload);
        expect(res.statusCode).toBe(409);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalled();
        expect(mockAddUser).not.toHaveBeenCalled();
        expect(mockContext.prisma.user.create).not.toHaveBeenCalled();
        expect(mockGetToken).not.toHaveBeenCalled();
    });

    it('should throw if auth service doesn\'t return 200', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue(null);
        const userId = 12;
        mockAddUser.mockResolvedValue(userId);
        mockGetToken.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/account/register')
            .send(payload);
        expect(res.statusCode).toBe(500);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalled();
        expect(mockAddUser).toHaveBeenCalled();
        expect(mockContext.prisma.user.create).toHaveBeenCalled();
        expect(mockGetToken).toHaveBeenCalled();
    });
});
