import fetch from 'node-fetch';
import { paths } from '../apiTypes/apiAuth.auto';

type Token = paths['/validate']['post']['requestBody']['content']['text/plain'];

export async function validate(authUrl: string, token: Token) {
    const authRes = await fetch(`${authUrl}/validate`, {
        method: 'post',
        body: token,
        headers: { 'Content-Type': 'text/plain' },
    });
    if (authRes.status === 200) {
        return authRes.text();
    }
    if (authRes.status === 401) {
        return null;
    }
    throw Error('auth service validate returned the wrong status code');
}
