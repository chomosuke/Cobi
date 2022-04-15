/* eslint-disable no-restricted-syntax */
import fetch from 'node-fetch';
import { parse } from '../../src/auth/parse';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const payload = { username: 'username', password: 'somehash' };
const authToken = 'authToken';
const authUrl = 'https://somehost';

describe('parse token', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should return token if status 200', async () => {
        mockFetch.mockResolvedValue({
            text: () => Promise.resolve(authToken),
            status: 200,
        } as Awaited<ReturnType<typeof fetch>>);
        expect(await parse(authUrl, payload)).toBe(authToken);
        expect(mockFetch).toHaveBeenCalledWith(`${authUrl}/parse`, {
            method: 'post',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
        });
    });

    it('should return null if status 401', async () => {
        mockFetch.mockResolvedValue({
            text: async () => { throw new Error('this should not be read'); },
            status: 401,
        } as unknown as Awaited<ReturnType<typeof fetch>>);
        expect(await parse(authUrl, payload)).toBeNull();
    });

    it('should throw if status is not 401 or 200', async () => {
        mockFetch.mockResolvedValue({
            text: async () => { throw new Error('this should not be read'); },
            status: 500,
        } as unknown as Awaited<ReturnType<typeof fetch>>);
        await expect(parse(authUrl, payload)).rejects.toStrictEqual(expect.anything());
    });
});
