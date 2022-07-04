import fetch from 'node-fetch';
import { paths } from '../apiTypes/apiAuth.auto';

type Payload = paths['/add-user']['post']['requestBody']['content']['application/json'];

export async function addUser(authUrl: string, payload: Payload) {
    const authRes = await fetch(`${authUrl}/add-user`, {
        method: 'post',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });
    if (authRes.status === 200) {
        return parseInt(await authRes.text(), 10);
    }
    throw Error('auth service parse returned the wrong status code');
}
