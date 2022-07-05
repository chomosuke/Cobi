import request from 'supertest';
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';
import { changePassword } from '../../src/auth/changePassword';
import { PrismaClient } from '../../prisma';
import { authenticate } from '../../src/auth/authenticate';
import { mockAuthenticate } from '../auth/mockAuthenticate';
import { PrismaClientKnownRequestError } from '../../prisma/runtime';
import { getToken } from '../../src/auth/getToken';

jest.mock('../../src/auth/authenticate');
const authenticateMock = authenticate as jest.MockedFunction<typeof authenticate>;
const userId = 123;
authenticateMock.mockImplementation(mockAuthenticate(userId));

jest.mock('../../src/auth/changePassword');
const changePasswordMock = changePassword as jest.MockedFunction<typeof changePassword>;

jest.mock('../../src/auth/getToken');
const getTokenMock = getToken as jest.MockedFunction<typeof getToken>;

type Update = PrismaClient['user']['update'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        user: {
            update: jest.fn<Promise<{ id: number }>, Parameters<Update>>(),
        },
    },
    debug: true,
};

describe('account patch', () => {
    beforeEach(() => {
        getTokenMock.mockReset();
        mockContext.prisma.user.update.mockReset();
        changePasswordMock.mockReset();
        authenticateMock.mockClear();
    });

    // some conditional expect for each cases
    /* eslint-disable jest/no-conditional-expect */
    it.each([
        { username: 'username' },
        { password: 'password' },
        { username: 'username', password: 'password' },
        {},
    ])('should make changes: %o if everything succeed', async (changes) => {
        const payload = {
            currentPassword: 'currentPassword',
            ...changes,
        };
        mockContext.prisma.user.update.mockResolvedValue({ id: userId });
        // current password correct
        getTokenMock.mockResolvedValue('someToken');
        // change password success
        changePasswordMock.mockResolvedValue(true);
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/api/account')
            .set('Authorization', 'bearer someToken')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(authenticateMock).toHaveBeenCalled();
        expect(getTokenMock).toHaveBeenCalledWith(
            mockContext.authUrl,
            { userId, password: payload.currentPassword },
        );
        if (changes.username !== undefined) {
            expect(mockContext.prisma.user.update).toHaveBeenCalledTimes(1);
            expect(mockContext.prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { username: payload.username },
                select: { id: true },
            });
        } else {
            expect(mockContext.prisma.user.update).not.toHaveBeenCalled();
        }
        if (changes.password !== undefined) {
            expect(changePasswordMock).toHaveBeenCalledTimes(1);
            expect(changePasswordMock).toHaveBeenCalledWith(
                mockContext.authUrl,
                { userId, currentPassword: payload.currentPassword, newPassword: payload.password },
            );
        } else {
            expect(changePasswordMock).not.toHaveBeenCalled();
        }
    });
    /* eslint-enable jest/no-conditional-expect */

    it('should return 401 if currentPassword is incorrect', async () => {
        const payload = {
            currentPassword: 'currentPassword',
            username: 'username',
            password: 'password',
        };
        getTokenMock.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/api/account')
            .set('Authorization', 'bearer someToken')
            .send(payload);
        expect(res.statusCode).toBe(401);
        expect(getTokenMock).toHaveBeenCalled();
        expect(mockContext.prisma.user.update).not.toHaveBeenCalled();
        expect(changePasswordMock).not.toHaveBeenCalled();
    });

    it('should return 409 if username conflicts', async () => {
        const payload = {
            currentPassword: 'currentPassword',
            username: 'username',
            password: 'password',
        };
        mockContext.prisma.user.update.mockRejectedValue(
            new PrismaClientKnownRequestError('test error', 'P2002', 'random version'),
        );
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/api/account')
            .set('Authorization', 'bearer someToken')
            .send(payload);
        expect(res.statusCode).toBe(409);
        expect(getTokenMock).toHaveBeenCalled();
        expect(mockContext.prisma.user.update).toHaveBeenCalled();
        expect(changePasswordMock).not.toHaveBeenCalled();
    });

    it('should throw if an unknown error is thrown by prisma', async () => {
        const payload = {
            currentPassword: 'currentPassword',
            username: 'username',
            password: 'password',
        };
        mockContext.prisma.user.update.mockRejectedValue(
            new PrismaClientKnownRequestError('test error', 'P202', 'random version'),
        );
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/api/account')
            .set('Authorization', 'bearer someToken')
            .send(payload);
        expect(res.statusCode).toBe(500);
        expect(getTokenMock).toHaveBeenCalled();
        expect(mockContext.prisma.user.update).toHaveBeenCalled();
        expect(changePasswordMock).not.toHaveBeenCalled();
    });
});
