import request from 'supertest';
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';
import { PrismaClient } from '../../prisma';
import { authenticate } from '../../src/auth/authenticate';
import { mockAuthenticate } from '../auth/mockAuthenticate';
import { PrismaClientKnownRequestError } from '../../prisma/runtime';

jest.mock('../../src/auth/authenticate');
const authenticateMock = authenticate as jest.MockedFunction<typeof authenticate>;
const userId = 123;
authenticateMock.mockImplementation(mockAuthenticate(userId));

type Update = PrismaClient['user']['update'];
type FindUnique = PrismaClient['user']['findUnique'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        user: {
            update: jest.fn<Promise<{ id: number }>, Parameters<Update>>(),
            findUnique: jest.fn<Promise<{ password: string }>, Parameters<FindUnique>>(),
        },
    },
    debug: true,
};

describe('account patch', () => {
    beforeEach(() => {
        mockContext.prisma.user.update.mockReset();
        mockContext.prisma.user.findUnique.mockReset();
        authenticateMock.mockClear();
    });

    it.each([
        { username: 'username' },
        { password: 'password' },
        { username: 'username', password: 'password' },
        {},
    ])('should make changes: %o if everything line up', async (changes) => {
        const payload = {
            currentPassword: 'currentPassword',
            ...changes,
        };
        mockContext.prisma.user.update.mockResolvedValue({ id: userId });
        mockContext.prisma.user.findUnique.mockResolvedValue({
            password: payload.currentPassword,
        });
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/api/account')
            .set('Authorization', 'bearer someToken')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: userId },
            select: { password: true },
            rejectOnNotFound: true,
        });
        expect(mockContext.prisma.user.update).toHaveBeenCalledTimes(1);
        expect(mockContext.prisma.user.update).toHaveBeenCalledWith({
            where: { id: userId },
            data: changes,
            select: { id: true },
        });
        expect(authenticateMock).toHaveBeenCalled();
    });

    it('should return 401 if currentPassword is incorrect', async () => {
        const payload = {
            currentPassword: 'currentPassword',
            username: 'username',
            password: 'password',
        };
        mockContext.prisma.user.findUnique.mockResolvedValue({
            password: 'otherPassword',
        });
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/api/account')
            .set('Authorization', 'bearer someToken')
            .send(payload);
        expect(res.statusCode).toBe(401);
        expect(mockContext.prisma.user.update).not.toHaveBeenCalled();
    });

    it('should return 409 if username conflicts', async () => {
        const payload = {
            currentPassword: 'currentPassword',
            username: 'username',
            password: 'password',
        };
        mockContext.prisma.user.findUnique.mockRejectedValue(
            new PrismaClientKnownRequestError('test error', 'P2002', 'random version'),
        );
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/api/account')
            .set('Authorization', 'bearer someToken')
            .send(payload);
        expect(res.statusCode).toBe(409);
        expect(mockContext.prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw if an unknown error is thrown by prisma', async () => {
        const payload = {
            currentPassword: 'currentPassword',
            username: 'username',
            password: 'password',
        };
        mockContext.prisma.user.findUnique.mockRejectedValue(
            new PrismaClientKnownRequestError('test error', 'P202', 'random version'),
        );
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/api/account')
            .set('Authorization', 'bearer someToken')
            .send(payload);
        expect(res.statusCode).toBe(500);
        expect(mockContext.prisma.user.update).not.toHaveBeenCalled();
    });
});
