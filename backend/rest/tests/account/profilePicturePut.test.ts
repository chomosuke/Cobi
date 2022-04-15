/* eslint-disable no-restricted-syntax */
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

type Update = PrismaClient['users']['update'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        users: {
            update: jest.fn<
            Promise<{ profilePictureUrl: string | null } | null>,
            Parameters<Update>
            >(),
        },
    },
    debug: true,
};

describe('get profile picture', () => {
    beforeEach(() => {
        mockContext.prisma.users.update.mockReset();
        authenticateMock.mockClear();
    });

    it('should return profile picture if exist', async () => {
        const profilePictureUrl = 'someUrl';
        const res = await request(constructApp(mockContext as unknown as Context))
            .put('/api/account/profile-picture')
            .set('Authorization', 'bearer someToken')
            .set('Content-type', 'text/plain')
            .send(profilePictureUrl);
        expect(res.statusCode).toBe(200);
        expect(mockContext.prisma.users.update).toHaveBeenCalledWith({
            where: { id: userId },
            data: { profilePictureUrl },
            select: { id: true },
        });
        expect(authenticateMock).toHaveBeenCalled();
    });
});
