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

type Update = PrismaClient['invite']['update'];
type FindUnique = PrismaClient['invite']['findUnique'];
type Delete = PrismaClient['invite']['delete'];
type Create = PrismaClient['contact']['create'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        contact: {
            create: jest.fn<Promise<{ chatId: number }>, Parameters<Create>>(),
        },
        invite: {
            findUnique: jest.fn<Promise<{ rejected: boolean } | null>, Parameters<FindUnique>>(),
            update: jest.fn<Promise<{ rejected: boolean }>, Parameters<Update>>(),
            delete: jest.fn<Promise<{ rejected: boolean }>, Parameters<Delete>>(),
        },
        $transaction: (promises: Promise<unknown>[]) => Promise.all(promises),
    },
    debug: true,
};

describe.each(['accept', 'reject'])('%sing invite', (response) => {
    beforeEach(() => {
        mockContext.prisma.contact.create.mockReset();
        mockContext.prisma.invite.findUnique.mockReset();
        mockContext.prisma.invite.update.mockReset();
        mockContext.prisma.invite.delete.mockReset();
        authenticateMock.mockClear();
    });

    if (response === 'accept') {
        it('should delete invite & create new contact', async () => {
            const receiverId = 2;
            mockContext.prisma.invite.findUnique.mockResolvedValue({ rejected: false });
            const res = await request(constructApp(mockContext as unknown as Context))
                .post(`/api/contact/invite/incoming/${receiverId}`)
                .set('Authorization', 'bearer someToken')
                .set('Content-type', 'text/plain')
                .send(response);
            expect(authenticateMock).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
            expect(mockContext.prisma.invite.findUnique).toHaveBeenCalledWith({
                where: {
                    senderId_receiverId: {
                        senderId: userId,
                        receiverId,
                    },
                },
                select: {
                    rejected: true,
                },
            });
            expect(mockContext.prisma.invite.delete).toHaveBeenCalledTimes(1);
            expect(mockContext.prisma.invite.delete).toHaveBeenCalledWith({
                where: {
                    senderId_receiverId: {
                        senderId: userId,
                        receiverId,
                    },
                },
                select: {
                    rejected: true,
                },
            });
            expect(mockContext.prisma.contact.create).toHaveBeenCalledTimes(1);
            const userIds = [userId, receiverId];
            expect(mockContext.prisma.contact.create).toHaveBeenCalledWith({
                data: {
                    user1: {
                        connect: {
                            id: Math.min(...userIds),
                        },
                    },
                    user2: {
                        connect: {
                            id: Math.max(...userIds),
                        },
                    },
                    chat: {
                        create: {
                            groupChatId: null,
                        },
                    },
                },
                select: {
                    chatId: true,
                },
            });
            expect(mockContext.prisma.invite.update).not.toHaveBeenCalled();
        });
    }

    if (response === 'reject') {
        it('should update invite to rejected', async () => {
            const receiverId = 2;
            mockContext.prisma.invite.findUnique.mockResolvedValue({ rejected: false });
            const res = await request(constructApp(mockContext as unknown as Context))
                .post(`/api/contact/invite/incoming/${receiverId}`)
                .set('Authorization', 'bearer someToken')
                .set('Content-type', 'text/plain')
                .send(response);
            expect(res.statusCode).toBe(200);
            expect(mockContext.prisma.invite.findUnique).toHaveBeenCalledWith({
                where: {
                    senderId_receiverId: {
                        senderId: userId,
                        receiverId,
                    },
                },
                select: {
                    rejected: true,
                },
            });
            expect(mockContext.prisma.invite.update).toHaveBeenCalledTimes(1);
            expect(mockContext.prisma.invite.update).toHaveBeenCalledWith({
                where: {
                    senderId_receiverId: {
                        senderId: userId,
                        receiverId,
                    },
                },
                select: {
                    rejected: true,
                },
                data: {
                    rejected: true,
                },
            });
            expect(mockContext.prisma.contact.create).not.toHaveBeenCalled();
            expect(mockContext.prisma.invite.delete).not.toHaveBeenCalled();
        });
    }

    it('should 404 if receiverId isn\'t a number', async () => {
        const receiverId = 'userId';
        mockContext.prisma.invite.findUnique.mockResolvedValue({ rejected: false });
        const res = await request(constructApp(mockContext as unknown as Context))
            .post(`/api/contact/invite/incoming/${receiverId}`)
            .set('Authorization', 'bearer someToken')
            .set('Content-type', 'text/plain')
            .send(response);
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.contact.create).not.toHaveBeenCalled();
        expect(mockContext.prisma.invite.findUnique).not.toHaveBeenCalled();
        expect(mockContext.prisma.invite.update).not.toHaveBeenCalled();
        expect(mockContext.prisma.invite.delete).not.toHaveBeenCalled();
    });

    it('should 404 if receiverId is the same as userId', async () => {
        const receiverId = userId;
        mockContext.prisma.invite.findUnique.mockResolvedValue({ rejected: false });
        const res = await request(constructApp(mockContext as unknown as Context))
            .post(`/api/contact/invite/incoming/${receiverId}`)
            .set('Authorization', 'bearer someToken')
            .set('Content-type', 'text/plain')
            .send(response);
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.contact.create).not.toHaveBeenCalled();
        expect(mockContext.prisma.invite.findUnique).not.toHaveBeenCalled();
        expect(mockContext.prisma.invite.update).not.toHaveBeenCalled();
        expect(mockContext.prisma.invite.delete).not.toHaveBeenCalled();
    });

    it('should 404 if invite with receiverId can\'t be found', async () => {
        const receiverId = 2;
        mockContext.prisma.invite.findUnique.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post(`/api/contact/invite/incoming/${receiverId}`)
            .set('Authorization', 'bearer someToken')
            .set('Content-type', 'text/plain')
            .send(response);
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.invite.findUnique).toHaveBeenCalled();
        expect(mockContext.prisma.contact.create).not.toHaveBeenCalled();
        expect(mockContext.prisma.invite.update).not.toHaveBeenCalled();
        expect(mockContext.prisma.invite.delete).not.toHaveBeenCalled();
    });

    it('should 404 if the invite is already rejected', async () => {
        const receiverId = 2;
        mockContext.prisma.invite.findUnique.mockResolvedValue({ rejected: true });
        const res = await request(constructApp(mockContext as unknown as Context))
            .post(`/api/contact/invite/incoming/${receiverId}`)
            .set('Authorization', 'bearer someToken')
            .set('Content-type', 'text/plain')
            .send(response);
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.invite.findUnique).toHaveBeenCalled();
        expect(mockContext.prisma.contact.create).not.toHaveBeenCalled();
        expect(mockContext.prisma.invite.update).not.toHaveBeenCalled();
        expect(mockContext.prisma.invite.delete).not.toHaveBeenCalled();
    });
});
