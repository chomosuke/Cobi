import fetch from 'node-fetch';
import { paths } from '../apiTypes/apiAuth.auto';

type Payload = paths['/get-token']['post']['requestBody']['content']['application/json'];

export async function getToken(authUrl: string, payload: Payload) {
    const authRes = await fetch(`${authUrl}/get-token`, {
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
    throw Error('auth service parse returned the wrong status code');
}
