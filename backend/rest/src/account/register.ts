import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '../../prisma/runtime';
import { paths } from '../apiTypes/api.auto';
import { parse } from '../auth/parse';
import { Context } from '../context';

type Req = paths['/account/register']['post']['requestBody']['content']['application/json'];

export async function register(context: Context, req: Request, res: Response) {
    const { prisma, authUrl } = context;
    // eslint-disable-next-line no-restricted-syntax
    const body = req.body as Req;
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

    const token = await parse(authUrl, body);
    if (token !== null) {
        res.send(token);
    } else {
        throw new Error('auth service failed to generate token');
    }
}
