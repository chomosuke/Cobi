import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ParseReq } from './api';
import { Context } from './context';

export async function parse(context: Context, req: Request, res: Response) {
    const { prisma, secret } = context;
    // eslint-disable-next-line no-restricted-syntax
    const body = req.body as ParseReq;
    const user = await prisma.users.findFirst({
        where: body,
    });
    if (user === null) {
        res.sendStatus(401);
    } else {
        res.send(jwt.sign({ userId: user.id.toString() }, secret));
    }
}
