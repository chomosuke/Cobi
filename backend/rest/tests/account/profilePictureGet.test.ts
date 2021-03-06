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

type FindUnique = PrismaClient['user']['findUnique'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        user: {
            findUnique: jest.fn<
            Promise<{ profilePictureUrl: string | null } | null>,
            Parameters<FindUnique>
            >(),
        },
    },
    debug: true,
};

describe('get profile picture', () => {
    beforeEach(() => {
        mockContext.prisma.user.findUnique.mockReset();
        authenticateMock.mockClear();
    });

    it('should return profile picture if exist', async () => {
        const profilePictureUrl = 'someUrl';
        mockContext.prisma.user.findUnique.mockResolvedValue({ profilePictureUrl });
        const res = await request(constructApp(mockContext as unknown as Context))
            .get('/api/account/profile-picture')
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(200);
        expect(res.text).toStrictEqual(profilePictureUrl);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: userId },
            select: { profilePictureUrl: true },
            rejectOnNotFound: true,
        });
        expect(authenticateMock).toHaveBeenCalled();
    });

    it('should not return profile picture if not exist', async () => {
        const profilePictureUrl = null;
        mockContext.prisma.user.findUnique.mockResolvedValue({ profilePictureUrl });
        const res = await request(constructApp(mockContext as unknown as Context))
            .get('/api/account/profile-picture')
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalled();
        expect(authenticateMock).toHaveBeenCalled();
    });
});
