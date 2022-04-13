import fetch from 'node-fetch';
import { paths } from '../apiTypes/apiAuth.auto';

type Payload = paths['/parse']['post']['requestBody']['content']['application/json'];

export async function parse(authUrl: string, payload: Payload) {
    const authRes = await fetch(`${authUrl}/parse`, {
        method: 'post',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });
    if (authRes.status === 200) {
        return authRes.text();
    }
    if (authRes.status === 401) {
        return null;
    }
    throw Error('auth service return wrong status code');
}
