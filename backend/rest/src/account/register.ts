import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { PrismaClientKnownRequestError } from '../../prisma/runtime';
import { RegisterReq } from '../apiTypes/api';
import { Context } from '../context';

export async function register(context: Context, req: Request, res: Response) {
    const { prisma, authUrl } = context;
    // eslint-disable-next-line no-restricted-syntax
    const body = req.body as RegisterReq;
    try {
        await prisma.users.create({
            data: body,
        });
    } catch (e) {
        if (
            e instanceof PrismaClientKnownRequestError
            // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
            && e.code === 'P2002'
        ) {
            res.sendStatus(409);
            return;
        }
        throw e;
    }

    const authRes = await fetch(`${authUrl}/parse`, {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });

    if (authRes.status === 200) {
        res.send(await authRes.text());
        return;
    }

    throw new Error('auth service failed to generate token');
}
