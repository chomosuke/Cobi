import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { paths } from '../api.auto';
import { Context } from '../context';

type Req = paths['/account/login']['post']['requestBody']['content']['application/json'];

export async function login(context: Context, req: Request, res: Response) {
    const { authUrl } = context;
    // eslint-disable-next-line no-restricted-syntax
    const body = req.body as Req;
    const authRes = await fetch(`${authUrl}/parse`, {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
    if (authRes.status === 200) {
        res.send(await authRes.text());
    } else if (authRes.status === 401) {
        res.sendStatus(401);
    } else {
        throw Error('auth service return wrong status code');
    }
}
