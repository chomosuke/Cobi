import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';

type Res = paths['/contact/invites/outgoing']['get']['responses']['200']['content']['application/json'];

export async function getInvitesOutgoing(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    const { userId } = req;
    const invites: Res = (await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            invitesOutgoing: {
                select: {
                    receiverId: true,
                },
                where: {
                    rejected: false,
                },
            },
        },
        rejectOnNotFound: true,
    })).invitesOutgoing.map((invite) => invite.receiverId.toString());
    res.json(invites);
}
