import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '../../prisma/runtime';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';
import { DataIntegrityError } from '../errors';

type Params = paths['/contact/{userId}']['delete']['parameters']['path'];
export async function delete$(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    // eslint-disable-next-line no-restricted-syntax
    const { userId } = req.params as Params;
    const otherUserId = parseInt(userId, 10);
    if (Number.isNaN(otherUserId)) {
        res.sendStatus(204);
        return;
    }
    const userIds = [otherUserId, req.userId];
    let chatId;
    try {
        const contact = await prisma.contact.delete({
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
        chatId = contact.chatId;
    } catch (e) {
        if (
            e instanceof PrismaClientKnownRequestError
            // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
            && e.code === 'P2025'
        ) {
            res.sendStatus(204);
            return;
        }
        throw e;
    }
    const { groupChatId } = await prisma.chat.delete({
        where: {
            id: chatId,
        },
        select: {
            groupChatId: true,
        },
    });
    if (groupChatId !== null) {
        throw new DataIntegrityError(
            `chat ${chatId} is connected with both contact ${userIds.toString()} and group_chat ${groupChatId}`,
        );
    }
    res.sendStatus(200);
}
