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

type Upsert = PrismaClient['invite']['upsert'];
const mockContext = {
    authUrl: undefined,
    prisma: {
        invite: {
            upsert: jest.fn<ReturnType<Upsert>, Parameters<Upsert>>(),
        },
    },
    debug: true,
};

describe('send invites', () => {
    beforeEach(() => {
        mockContext.prisma.invite.upsert.mockReset();
        authenticateMock.mockClear();
    });

    it('should create an invite or update an rejected invite', async () => {
        const receiverId = 2;
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/contact/invite/outgoing')
            .set('Authorization', 'bearer someToken')
            .set('Content-type', 'text/plain')
            .send(`${receiverId}`);
        expect(authenticateMock).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect(mockContext.prisma.invite.upsert).toHaveBeenCalledTimes(1);
        expect(mockContext.prisma.invite.upsert).toHaveBeenCalledWith({
            where: {
                senderId_receiverId: {
                    senderId: userId,
                    receiverId,
                },
            },
            update: {
                rejected: false,
            },
            create: {
                senderId: userId,
                receiverId,
                rejected: false,
            },
            select: {
                senderId: true,
            },
        });
    });

    it.each(['userId', `${userId}`])('should 404 if receiverId isn\'t a number or is the same as senderId', async (receiverId) => {
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/contact/invite/outgoing')
            .set('Authorization', 'bearer someToken')
            .set('Content-type', 'text/plain')
            .send(receiverId);
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.invite.upsert).not.toHaveBeenCalled();
    });

    it('should 404 if user with receiverId can\'t be found', async () => {
        const receiverId = 2;
        mockContext.prisma.invite.upsert.mockRejectedValue(
            new PrismaClientKnownRequestError('test error', 'P2003', 'random version'),
        );
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/contact/invite/outgoing')
            .set('Authorization', 'bearer someToken')
            .set('Content-type', 'text/plain')
            .send(`${receiverId}`);
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.invite.upsert).toHaveBeenCalledTimes(1);
    });

    it('should throw if random error is thrown by invite.upsert', async () => {
        const receiverId = 2;
        mockContext.prisma.invite.upsert.mockRejectedValue(
            new PrismaClientKnownRequestError('test error', 'P2005', 'random version'),
        );
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/api/contact/invite/outgoing')
            .set('Authorization', 'bearer someToken')
            .set('Content-type', 'text/plain')
            .send(`${receiverId}`);
        expect(res.statusCode).toBe(500);
        expect(mockContext.prisma.invite.upsert).toHaveBeenCalledTimes(1);
    });
});
