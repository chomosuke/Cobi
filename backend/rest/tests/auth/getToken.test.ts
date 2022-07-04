import fetch from 'node-fetch';
import { getToken } from '../../src/auth/getToken';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const payload = { userId: 123, password: 'somehash' };
const authToken = 'authToken';
const authUrl = 'https://somehost';

describe('get token', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should return token if status 200', async () => {
        mockFetch.mockResolvedValue({
            text: () => Promise.resolve(authToken),
            status: 200,
        } as Awaited<ReturnType<typeof fetch>>);
        expect(await getToken(authUrl, payload)).toBe(authToken);
        expect(mockFetch).toHaveBeenCalledWith(`${authUrl}/get-token`, {
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
        expect(await getToken(authUrl, payload)).toBeNull();
    });

    it('should throw if status is not 401 or 200', async () => {
        mockFetch.mockResolvedValue({
            text: async () => { throw new Error('this should not be read'); },
            status: 500,
        } as unknown as Awaited<ReturnType<typeof fetch>>);
        await expect(getToken(authUrl, payload)).rejects.toStrictEqual(expect.anything());
    });
});
