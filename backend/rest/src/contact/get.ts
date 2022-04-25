import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';

type Params = paths['/contact/{userId}']['get']['parameters']['path'];
type Res = paths['/contact/{userId}']['get']['responses']['200']['content']['application/json'];
export async function get(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    // eslint-disable-next-line no-restricted-syntax
    const { userId } = req.params as Params;
    const otherUserId = parseInt(userId, 10);
    if (Number.isNaN(otherUserId)) {
        res.sendStatus(404);
        return;
    }
    const userIds = [otherUserId, req.userId];
    const contact = await prisma.contact.findUnique({
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
    if (contact === null) {
        res.sendStatus(404);
        return;
    }
    const resBody: Res = {
        chatId: contact.chatId.toString(),
    };
    res.json(resBody);
}
