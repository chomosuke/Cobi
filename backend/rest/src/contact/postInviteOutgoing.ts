import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '../../prisma/runtime';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';

type Req = paths['/contact/invite/outgoing']['post']['requestBody']['content']['text/plain'];
export async function postInviteOutgoing(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    const { userId } = req;
    // eslint-disable-next-line no-restricted-syntax
    const otherUserId = req.body as Req;
    const receiverId = parseInt(otherUserId, 10);
    if (Number.isNaN(receiverId) || receiverId === userId) {
        res.sendStatus(404);
        return;
    }
    try {
        await prisma.invite.upsert({
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
    } catch (e) {
        if (
            e instanceof PrismaClientKnownRequestError
            // https://www.prisma.io/docs/reference/api-reference/error-reference#p2003
            && e.code === 'P2003'
        ) {
            res.sendStatus(404);
            return;
        }
        throw e;
    }
    res.sendStatus(200);
}
