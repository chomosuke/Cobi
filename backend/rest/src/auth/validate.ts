import fetch from 'node-fetch';

export async function validate(authUrl: string, token: string) {
    const authRes = await fetch(`${authUrl}/validate`, {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}
