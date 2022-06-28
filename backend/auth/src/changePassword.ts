import { Request, Response } from 'express';
import { paths } from './api.auto';
import { Context } from './context';
import { hash, compare } from './hash';

type Req = paths['/change-password']['patch']['requestBody']['content']['application/json'];

export async function changePassword(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    // eslint-disable-next-line no-restricted-syntax
    const { userId, currentPassword, newPassword } = req.body as Req;
    const user = await prisma.user.findUnique({
        select: { password: true },
        where: { id: userId },
    });
    if (user === null) {
        // user not found
        res.sendStatus(404);
        return;
    }
    if (!await compare(currentPassword, user.password)) {
        // password wrong
        res.sendStatus(401);
        return;
    }
    // everything is correct
    await prisma.user.update({
        select: { id: true },
        where: { id: userId },
        data: { password: await hash(newPassword) },
    });
    res.sendStatus(200);
}
