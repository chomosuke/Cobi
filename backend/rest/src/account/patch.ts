import { Request, Response } from 'express';
import { Context } from '../context';
import '../auth/authenticate';
import { paths } from '../apiTypes/api.auto';
import { PrismaClientKnownRequestError } from '../../prisma/runtime';

type Req = paths['/account']['patch']['requestBody']['content']['application/json'];
export async function patch(context: Context, req: Request, res: Response) {
    const { userId } = req;
    const { prisma } = context;
    // eslint-disable-next-line no-restricted-syntax
    const { currentPassword, ...changes } = req.body as Req;
    let user;
    try {
        user = await prisma.users.findUnique({
            where: {
                id: userId,
            },
            select: {
                password: true,
            },
            rejectOnNotFound: true,
        });
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
            res.sendStatus(409);
            return;
        }
        throw e;
    }
    if (currentPassword !== user.password) {
        res.sendStatus(401);
        return;
    }
    await prisma.users.update({
        where: {
            id: userId,
        },
        data: changes,
    });
    res.sendStatus(200);
}
