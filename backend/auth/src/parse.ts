import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { paths } from './api.auto';
import { Context } from './context';

type Req = paths['/parse']['post']['requestBody']['content']['application/json'];

export async function parse(context: Context, req: Request, res: Response) {
    const { prisma, secret } = context;
    // eslint-disable-next-line no-restricted-syntax
    const body = req.body as Req;
    const user = await prisma.user.findFirst({
        where: body,
        select: {
            id: true,
        },
    });
    if (user === null) {
        res.sendStatus(401);
    } else {
        res.send(jwt.sign({ userId: user.id.toString() }, secret));
    }
}
