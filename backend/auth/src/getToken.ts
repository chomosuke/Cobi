import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { paths } from './api.auto';
import { Context } from './context';
import { compare } from './hash';

type Req = paths['/get-token']['post']['requestBody']['content']['application/json'];

export async function getToken(context: Context, req: Request, res: Response) {
    const { prisma, secret } = context;
    // eslint-disable-next-line no-restricted-syntax
    const { userId, password } = req.body as Req;
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            password: true,
        },
    });
    if (user === null || !await compare(password, user.password)) {
        res.sendStatus(401);
    } else {
        res.send(jwt.sign({ userId: userId.toString() }, secret));
    }
}
