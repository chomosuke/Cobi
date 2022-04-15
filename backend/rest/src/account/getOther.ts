import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import { Context } from '../context';

type Res = paths['/account/{userId}']['get']['responses']['200']['content']['application/json'];

type Params = paths['/account/{userId}']['get']['parameters']['path'];

export async function getOther(context: Context, req: Request, res: Response) {
    // eslint-disable-next-line no-restricted-syntax
    const { userId } = req.params as Params;
    const { prisma } = context;
    const id = parseInt(userId, 10);
    if (Number.isNaN(id)) {
        res.sendStatus(404);
        return;
    }
    const info = await prisma.users.findUnique({
        where: {
            id,
        },
        select: {
            username: true,
        },
    });
    if (info === null) {
        res.sendStatus(404);
        return;
    }
    const resBody: Res = info;
    res.json(resBody);
}
