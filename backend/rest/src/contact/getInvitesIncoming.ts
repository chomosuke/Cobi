import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';

type Res = paths['/contact/invites/incoming']['get']['responses']['200']['content']['application/json'];

export async function getInvitesIncoming(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    const { userId } = req;
    const invites: Res = (await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            invitesIncoming: {
                select: {
                    senderId: true,
                },
                where: {
                    rejected: false,
                },
            },
        },
        rejectOnNotFound: true,
    })).invitesIncoming.map((invite) => invite.senderId.toString());
    res.json(invites);
}
