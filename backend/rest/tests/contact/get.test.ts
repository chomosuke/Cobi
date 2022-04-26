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
        contact: {
            findUnique: jest.fn<Promise<{ chatId: string } | null>, Parameters<FindUnique>>(),
        },
    },
    debug: true,
};

describe('contact get', () => {
    beforeEach(() => {
        mockContext.prisma.contact.findUnique.mockReset();
        authenticateMock.mockClear();
    });

    it.each(['1', '6'])('should respond with chatId if contact with userId %p is found', async (contactUserId) => {
        const chatId = '123';
        mockContext.prisma.contact.findUnique.mockResolvedValue({ chatId });
        const res = await request(constructApp(mockContext as unknown as Context))
            .get(`/api/contact/${contactUserId}`)
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ chatId });
        const userIds = [parseInt(contactUserId, 10), userId];
        expect(mockContext.prisma.contact.findUnique).toHaveBeenCalledWith({
            where: {
                userId1_userId2: {
                    userId1: Math.min(...userIds),
                    userId2: Math.max(...userIds),
                },
            },
            select: {
                chatId: true,
            },
        });
        expect(authenticateMock).toHaveBeenCalled();
    });

    it('should respond with 404 if userId is not a number', async () => {
        const contactUserId = 'userId';
        const res = await request(constructApp(mockContext as unknown as Context))
            .get(`/api/contact/${contactUserId}`)
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.contact.findUnique).not.toHaveBeenCalled();
        expect(authenticateMock).toHaveBeenCalled();
    });

    it('should respond with 404 if userId is not found', async () => {
        const contactUserId = '123';
        mockContext.prisma.contact.findUnique.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .get(`/api/contact/${contactUserId}`)
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.contact.findUnique).toHaveBeenCalled();
        expect(authenticateMock).toHaveBeenCalled();
    });
});
