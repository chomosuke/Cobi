import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';

type Res = paths['/account']['get']['responses']['200']['content']['application/json'];

export async function get(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    const user = await prisma.user.findUnique({
        where: {
            id: req.userId,
        },
        select: {
            username: true,
        },
        rejectOnNotFound: true,
    });
    const resBody: Res = {
        username: user.username,
    };
    res.json(resBody);
}
