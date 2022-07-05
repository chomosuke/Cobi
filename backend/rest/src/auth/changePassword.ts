import fetch from 'node-fetch';
import { paths } from '../apiTypes/apiAuth.auto';

type Payload = paths['/change-password']['patch']['requestBody']['content']['application/json'];

export async function changePassword(authUrl: string, payload: Payload) {
    const authRes = await fetch(`${authUrl}/change-password`, {
        method: 'patch',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });
    if (authRes.status === 200) {
        return true;
    }
    if (authRes.status === 401) {
        return false;
    }
    throw Error('auth service change-password returned the wrong status code');
}
