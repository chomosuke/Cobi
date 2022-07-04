import fetch from 'node-fetch';
import { paths } from '../apiTypes/apiAuth.auto';

type Token = paths['/validate-token']['post']['requestBody']['content']['text/plain'];

export async function validateToken(authUrl: string, token: Token) {
    const authRes = await fetch(`${authUrl}/validate-token`, {
        method: 'post',
        body: token,
        headers: { 'Content-Type': 'text/plain' },
    });
    if (authRes.status === 200) {
        return parseInt(await authRes.text(), 10);
    }
    if (authRes.status === 401) {
        return null;
    }
    throw Error('auth service validate-token returned the wrong status code');
}
