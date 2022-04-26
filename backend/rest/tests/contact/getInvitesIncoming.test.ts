import request from 'supertest';
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';
import { PrismaClient } from '../../prisma';
import { authenticate } from '../../src/auth/authenticate';
import { mockAuthenticate } from '../auth/mockAuthenticate';

jest.mock('../../src/auth/authenticate');
const authenticateMock = authenticate as jest.MockedFunction<typeof authenticate>;
const userId = 4;
authenticateMock.mockImplementation(mockAuthenticate(userId));

type FindUnique = PrismaClient['contact']['findUnique'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        user: {
            findUnique: jest.fn<Promise<{
                invitesIncoming: {
                    senderId: number;
                }[];
            }>, Parameters<FindUnique>>(),
        },
    },
    debug: true,
};

describe('get outgoing invites', () => {
    beforeEach(() => {
        mockContext.prisma.user.findUnique.mockReset();
        authenticateMock.mockClear();
    });

    it('should return all outgoing invites of user', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue({
            invitesIncoming: [
                { senderId: 5 },
                { senderId: 6 },
                { senderId: 7 },
            ],
        });
        const res = await request(constructApp(mockContext as unknown as Context))
            .get('/api/contact/invites/incoming')
            .set('Authorization', 'bearer someToken');
        expect(authenticateMock).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect((res.body as string[]).sort()).toEqual(['5', '6', '7']);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: userId },
            select: {
                invitesIncoming: {
                    select: {
                        senderId: true,
                    },
                    where: {
                        rejected: false,
                    },
                },
            },
            rejectOnNotFound: true,
        });
    });
});
