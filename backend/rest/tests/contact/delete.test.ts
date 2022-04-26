import request from 'supertest';
import { Context } from '../../src/context';
import { constructApp } from '../../src/constructApp';
import { PrismaClient } from '../../prisma';
import { authenticate } from '../../src/auth/authenticate';
import { mockAuthenticate } from '../auth/mockAuthenticate';
import { PrismaClientKnownRequestError } from '../../prisma/runtime';

jest.mock('../../src/auth/authenticate');
const authenticateMock = authenticate as jest.MockedFunction<typeof authenticate>;
const userId = 4;
authenticateMock.mockImplementation(mockAuthenticate(userId));

type ContactDelete = PrismaClient['contact']['delete'];
type ChatDelete = PrismaClient['chat']['delete'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        contact: {
            delete: jest.fn<Promise<{ chatId: number }>, Parameters<ContactDelete>>(),
        },
        chat: {
            delete: jest.fn<Promise<{ groupChatId: number | null }>, Parameters<ChatDelete>>(),
        },
    },
    debug: true,
};
const chatId = 154;

describe('contact delete', () => {
    beforeEach(() => {
        mockContext.prisma.contact.delete.mockReset();
        mockContext.prisma.chat.delete.mockReset();
        authenticateMock.mockClear();
    });

    it.each(['3', '5'])('should respond 200 if contact with userId %p is found', async (contactUserId) => {
        mockContext.prisma.contact.delete.mockResolvedValue({ chatId });
        mockContext.prisma.chat.delete.mockResolvedValue({ groupChatId: null });
        const res = await request(constructApp(mockContext as unknown as Context))
            .delete(`/api/contact/${contactUserId}`)
            .set('Authorization', 'bearer someToken');
        expect(authenticateMock).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        const userIds = [parseInt(contactUserId, 10), userId];
        expect(mockContext.prisma.contact.delete).toHaveBeenCalledTimes(1);
        expect(mockContext.prisma.contact.delete).toHaveBeenCalledWith({
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
        expect(mockContext.prisma.chat.delete).toHaveBeenCalledTimes(1);
        expect(mockContext.prisma.chat.delete).toHaveBeenCalledWith({
            where: {
                id: chatId,
            },
            select: {
                groupChatId: true,
            },
        });
    });

    it('should respond with 204 if userId is not a number', async () => {
        const contactUserId = 'userId';
        const res = await request(constructApp(mockContext as unknown as Context))
            .delete(`/api/contact/${contactUserId}`)
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(204);
        expect(mockContext.prisma.contact.delete).not.toHaveBeenCalled();
        expect(mockContext.prisma.chat.delete).not.toHaveBeenCalled();
    });

    it('should respond with 204 if userId is not found', async () => {
        const contactUserId = '123';
        mockContext.prisma.contact.delete.mockRejectedValue(
            new PrismaClientKnownRequestError('test error', 'P2025', 'random version'),
        );
        const res = await request(constructApp(mockContext as unknown as Context))
            .delete(`/api/contact/${contactUserId}`)
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(204);
        expect(mockContext.prisma.contact.delete).toHaveBeenCalledTimes(1);
        expect(mockContext.prisma.chat.delete).not.toHaveBeenCalled();
    });

    it('should throw if random error is thrown by contact.delete', async () => {
        const contactUserId = '123';
        mockContext.prisma.contact.delete.mockRejectedValue(
            new PrismaClientKnownRequestError('test error', 'P2005', 'random version'),
        );
        const res = await request(constructApp(mockContext as unknown as Context))
            .delete(`/api/contact/${contactUserId}`)
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(500);
        expect(mockContext.prisma.contact.delete).toHaveBeenCalledTimes(1);
        expect(mockContext.prisma.chat.delete).not.toHaveBeenCalled();
    });

    it('should throw deleted chat have groupChatId', async () => {
        const contactUserId = '123';
        mockContext.prisma.contact.delete.mockResolvedValue({ chatId });
        mockContext.prisma.chat.delete.mockResolvedValue({ groupChatId: 1 });
        const res = await request(constructApp(mockContext as unknown as Context))
            .delete(`/api/contact/${contactUserId}`)
            .set('Authorization', 'bearer someToken');
        expect(res.statusCode).toBe(500);
        expect(mockContext.prisma.contact.delete).toHaveBeenCalledTimes(1);
        expect(mockContext.prisma.chat.delete).toHaveBeenCalledTimes(1);
    });
});
