import { Request, Response } from 'express';
import { PrismaClient } from '../../prisma';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';

type Params = paths['/contact/invite/incoming/{userId}']['post']['parameters']['path'];
type Req = paths['/contact/invite/incoming/{userId}']['post']['requestBody']['content']['text/plain'];
export async function postInviteIncoming(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    const { userId } = req;
    // eslint-disable-next-line no-restricted-syntax
    const action = req.body as Req;
    // eslint-disable-next-line no-restricted-syntax
    const otherUserId = (req.params as Params).userId;
    const receiverId = parseInt(otherUserId, 10);
    if (Number.isNaN(receiverId) || receiverId === userId) {
        res.sendStatus(404);
        return;
    }
    const senderIdReceiverId = {
        senderId: userId,
        receiverId,
    };
    const invite = await prisma.invite.findUnique({
        where: {
            senderId_receiverId: senderIdReceiverId,
        },
        select: {
            rejected: true,
        },
    });
    if (invite === null || invite.rejected) {
        res.sendStatus(404);
        return;
    }
    switch (action) {
        case 'accept':
            await acceptInvite(prisma, userId, receiverId);
            break;
        case 'reject':
            await rejectInvite(prisma, userId, receiverId);
            break;
        default:
            throw new Error('action is not accept or reject');
    }
    res.sendStatus(200);
}

async function acceptInvite(
    prisma: PrismaClient,
    senderId: number,
    receiverId: number,
) {
    const userIds = [senderId, receiverId];
    await prisma.$transaction([
        prisma.invite.delete({
            where: {
                senderId_receiverId: {
                    senderId,
                    receiverId,
                },
            },
            select: {
                rejected: true,
            },
        }),
        prisma.contact.create({
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
        }),
    ]);
}

async function rejectInvite(
    prisma: PrismaClient,
    senderId: number,
    receiverId: number,
) {
    await prisma.invite.update({
        where: {
            senderId_receiverId: {
                senderId,
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
}
