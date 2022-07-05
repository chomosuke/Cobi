import { Request, Response } from 'express';
import { Context } from '../context';
import '../auth/authenticate';
import { paths } from '../apiTypes/api.auto';
import { PrismaClientKnownRequestError } from '../../prisma/runtime';
import { getToken } from '../auth/getToken';
import { changePassword } from '../auth/changePassword';

type Req = paths['/account']['patch']['requestBody']['content']['application/json'];

export async function patch(context: Context, req: Request, res: Response) {
    const { userId } = req;
    const { prisma, authUrl } = context;
    // eslint-disable-next-line no-restricted-syntax
    const { currentPassword, username, password } = req.body as Req;
    if (await getToken(authUrl, { userId, password: currentPassword }) === null) {
        res.sendStatus(401);
        return;
    }
    if (username !== undefined) {
        try {
            await prisma.user.update({
                where: { id: userId },
                select: { id: true },
                data: { username },
            });
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
                // unique constrain violated, username taken
                res.sendStatus(409);
                return;
            }
            throw e;
        }
    }
    if (password !== undefined) {
        await changePassword(authUrl, {
            userId,
            currentPassword,
            newPassword: password,
        });
    }
    res.sendStatus(200);
}
