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

type FindUnique = PrismaClient['user']['findUnique'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        user: {
            findUnique: jest.fn<Promise<{
                contacts1: {
                    userId2: number;
                }[];
                contacts2: {
                    userId1: number;
                }[];
            }>, Parameters<FindUnique>>(),
        },
    },
    debug: true,
};

describe('get contacts', () => {
    beforeEach(() => {
        mockContext.prisma.user.findUnique.mockReset();
        authenticateMock.mockClear();
    });

    it('should return all contacts of user', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue({
            contacts1: [
                { userId2: 5 },
                { userId2: 6 },
                { userId2: 7 },
            ],
            contacts2: [
                { userId1: 1 },
                { userId1: 2 },
                { userId1: 3 },
            ],
        });
        const res = await request(constructApp(mockContext as unknown as Context))
            .get('/api/contacts')
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(200);
        expect((res.body as string[]).sort()).toEqual(['1', '2', '3', '5', '6', '7']);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: userId },
            select: {
                contacts1: {
                    select: {
                        userId2: true,
                    },
                },
                contacts2: {
                    select: {
                        userId1: true,
                    },
                },
            },
            rejectOnNotFound: true,
        });
        expect(authenticateMock).toHaveBeenCalled();
    });
});
