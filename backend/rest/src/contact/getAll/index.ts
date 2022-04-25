import { Request, Response } from 'express';
import { paths } from '../../apiTypes/api.auto';
import '../../auth/authenticate';
import { Context } from '../../context';
import { getAllContacts } from './getAllContacts';

type Res = paths['/contacts']['get']['responses']['200']['content']['application/json'];
export async function getAll(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    const contacts: Res = (await getAllContacts(prisma, req.userId)).map((c) => c.toString());
    res.json(contacts);
}
