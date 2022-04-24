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

type Update = PrismaClient['user']['update'];
type FindUnique = PrismaClient['user']['findUnique'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        user: {
            update: jest.fn<
            Promise<{ id: number }>,
            Parameters<Update>
            >(),
            findUnique: jest.fn<
            Promise<{ profilePictureUrl: string | null }>,
            Parameters<FindUnique>
            >(),
        },
    },
    debug: true,
};

describe('delete profile picture', () => {
    beforeEach(() => {
        mockContext.prisma.user.update.mockReset();
        mockContext.prisma.user.findUnique.mockReset();
        authenticateMock.mockClear();
    });

    it('should delete profile picture if exist', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue({
            profilePictureUrl: 'some other url',
        });
        const res = await request(constructApp(mockContext as unknown as Context))
            .delete('/api/account/profile-picture')
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(200);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: userId },
            select: { profilePictureUrl: true },
            rejectOnNotFound: true,
        });
        expect(mockContext.prisma.user.update).toHaveBeenCalledWith({
            where: { id: userId },
            data: { profilePictureUrl: null },
            select: { id: true },
        });
        expect(authenticateMock).toHaveBeenCalled();
    });

    it('should return 204 if profile picture does not exist', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue({
            profilePictureUrl: null,
        });
        const res = await request(constructApp(mockContext as unknown as Context))
            .delete('/api/account/profile-picture')
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(204);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalled();
        expect(mockContext.prisma.user.update).not.toHaveBeenCalled();
        expect(authenticateMock).toHaveBeenCalled();
    });
});
