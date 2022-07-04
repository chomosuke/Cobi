import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import { addUser } from '../auth/addUser';
import { getToken } from '../auth/getToken';
import { Context } from '../context';

type Req = paths['/account/register']['post']['requestBody']['content']['application/json'];

export async function register(context: Context, req: Request, res: Response) {
    const { prisma, authUrl } = context;
    // eslint-disable-next-line no-restricted-syntax
    const { username, password } = req.body as Req;
    if (await prisma.user.findUnique({
        select: { id: true },
        where: { username },
    }) !== null) {
        // user with username already exist
        res.sendStatus(409);
        return;
    }
    const userId = await addUser(authUrl, { password });
    await prisma.user.create({
        data: { id: userId, username },
    });
    const token = await getToken(authUrl, { userId, password });
    if (token !== null) {
        res.send(token);
    } else {
        throw new Error('auth service failed to generate token');
    }
}
