import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import '../auth/authenticate';
import { Context } from '../context';

type Res = paths['/account/profile-picture']['get']['responses']['200']['content']['text/plain'];
export async function profilePictureGet(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    const { profilePictureUrl } = await prisma.user.findUnique({
        where: {
            id: req.userId,
        },
        select: {
            profilePictureUrl: true,
        },
        rejectOnNotFound: true,
    });
    if (profilePictureUrl === null) {
        res.sendStatus(404);
        return;
    }
    const resBody: Res = profilePictureUrl;
    res.send(resBody);
}
