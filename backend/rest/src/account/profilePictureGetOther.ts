import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import { Context } from '../context';

type Res = paths['/account/profile-picture/{userId}']['get']['responses']['200']['content']['text/plain'];

type Params = paths['/account/profile-picture/{userId}']['get']['parameters']['path'];

export async function profilePictureGetOther(context: Context, req: Request, res: Response) {
    // eslint-disable-next-line no-restricted-syntax
    const { userId } = req.params as Params;
    const { prisma } = context;
    const id = parseInt(userId, 10);
    if (Number.isNaN(id)) {
        res.sendStatus(404);
        return;
    }
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
        select: {
            profilePictureUrl: true,
        },
    });
    if (user === null || user.profilePictureUrl === null) {
        res.sendStatus(404);
        return;
    }
    const resBody: Res = user.profilePictureUrl;
    res.send(resBody);
}
