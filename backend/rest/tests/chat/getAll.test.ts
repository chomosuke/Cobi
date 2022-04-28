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

type FindMany = PrismaClient['chat']['findMany'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        chat: {
            findMany: jest.fn<Promise<{
                id: number;
            }[]>, Parameters<FindMany>>(),
        },
    },
    debug: true,
};

describe('get chats', () => {
    beforeEach(() => {
        mockContext.prisma.chat.findMany.mockReset();
        authenticateMock.mockClear();
    });

    it('should return all chats of user', async () => {
        mockContext.prisma.chat.findMany.mockResolvedValue([
            { id: 1 },
            { id: 5 },
            { id: 9 },
        ]);
        const res = await request(constructApp(mockContext as unknown as Context))
            .get('/api/chats')
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(200);
        expect((res.body as string[]).sort()).toEqual(['1', '5', '9']);
        expect(mockContext.prisma.chat.findMany).toHaveBeenCalledWith({
            select: {
                id: true,
            },
            where: {
                OR: [
                    {
                        groupChat: {
                            memberships: {
                                some: { userId },
                            },
                        },
                    },
                    {
                        contact: {
                            OR: [
                                { userId1: userId },
                                { userId2: userId },
                            ],
                        },
                    },
                ],
            },
        });
        expect(authenticateMock).toHaveBeenCalled();
    });
});
