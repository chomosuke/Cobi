import { Request, Response } from 'express';
import { paths } from '../apiTypes/api.auto';
import { parse } from '../auth/parse';
import { Context } from '../context';

type Req = paths['/account/login']['post']['requestBody']['content']['application/json'];

export async function login(context: Context, req: Request, res: Response) {
    const { authUrl } = context;
    // eslint-disable-next-line no-restricted-syntax
    const body = req.body as Req;
    const token = await parse(authUrl, body);
    if (token !== null) {
        res.send(token);
    } else {
        res.sendStatus(401);
    }
}
