import { Request, Response } from 'express';
import '../auth/authenticate';
import { Context } from '../context';

export async function profilePictureDelete(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    const previousUrl = (await prisma.user.findUnique({
        where: { id: req.userId },
        select: { profilePictureUrl: true },
        rejectOnNotFound: true,
    })).profilePictureUrl;
    if (previousUrl === null) {
        res.sendStatus(204);
        return;
    }
    await prisma.user.update({
        where: { id: req.userId },
        select: { id: true },
        data: { profilePictureUrl: null },
    });
    res.sendStatus(200);
}
