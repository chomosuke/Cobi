import { Request, Response } from 'express';
import { paths } from '../../apiTypes/api.auto';
import { Context } from '../../context';
import { searchDB } from './searchDB';

type Query = paths['/account/search']['get']['parameters']['query'];

export async function search(context: Context, req: Request, res: Response) {
    const { prisma } = context;
    // eslint-disable-next-line no-restricted-syntax
    const query = req.query as Query;
    const userIds = await searchDB(prisma, query.username);
    res.json(userIds.map((id) => id.toString()));
}
