import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';

type Req = paths['/account/profile-picture']['put']['requestBody']['content']['text/plain'];
export async function profilePicturePut(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    await prisma.users.update({
        where: {
            id: req.userId,
        },
        select: {
            id: true,
        },
        data: {
            // eslint-disable-next-line no-restricted-syntax
            profilePictureUrl: req.body as Req,
        },
    });
    res.sendStatus(200);
}
