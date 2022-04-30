import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';

type Res = paths['/chats']['get']['responses']['200']['content']['application/json'];

export async function getAll(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    const { userId } = req;
    const chats = await prisma.chat.findMany({
        select: {
            id: true,
        },
        where: {
            OR: [
                {
                    groupChat: {
                        memberships: {
                            some: { userId },
                        },
                    },
                },
                {
                    contact: {
                        OR: [
                            { userId1: userId },
                            { userId2: userId },
                        ],
                    },
                },
            ],
        },
    });
    const resBody: Res = chats.map((c) => c.id.toString());
    res.json(resBody);
}
