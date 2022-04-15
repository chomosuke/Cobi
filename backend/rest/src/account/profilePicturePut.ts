import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';

type Req = paths['/account/profile-picture']['put']['requestBody']['content']['text/plain'];
export async function profilePicturePut(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    const previousUrl = (await prisma.users.findUnique({
        where: { id: req.userId },
        select: { profilePictureUrl: true },
        rejectOnNotFound: true,
    })).profilePictureUrl;
    await prisma.users.update({
        where: { id: req.userId },
        select: { id: true },
        // eslint-disable-next-line no-restricted-syntax
        data: { profilePictureUrl: req.body as Req },
    });
    if (previousUrl === null) {
        res.sendStatus(201);
    } else {
        res.sendStatus(200);
    }
}
