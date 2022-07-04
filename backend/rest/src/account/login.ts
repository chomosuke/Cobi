import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import { getToken } from '../auth/getToken';
import { Context } from '../context';

type Req = paths['/account/login']['post']['requestBody']['content']['application/json'];

export async function login(context: Context, req: Request, res: Response) {
    const { authUrl, prisma } = context;
    // eslint-disable-next-line no-restricted-syntax
    const { username, password } = req.body as Req;
    const user = await prisma.user.findUnique({
        select: { id: true },
        where: { username },
    })
    if (user === null) {
        // username incorrect
        res.sendStatus(401);
        return;
    }
    const token = await getToken(authUrl, { userId: user.id, password });
    if (token !== null) {
        res.send(token);
    } else {
        res.sendStatus(401);
    }
}
