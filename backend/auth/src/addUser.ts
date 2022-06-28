import { Request, Response } from 'express';
import { paths } from './api.auto';
import { Context } from './context';
import { hash } from './hash';

type Req = paths['/add-user']['post']['requestBody']['content']['application/json'];

export async function addUser(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    // eslint-disable-next-line no-restricted-syntax
    const { password } = req.body as Req;
    const { id: userId } = await prisma.user.create({
        select: { id: true },
        data: { password: await hash(password) },
    });
    res.send(userId.toString());
}
