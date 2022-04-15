/* eslint-disable no-restricted-syntax */
import fetch from 'node-fetch';
import { validate } from '../../src/auth/validate';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const userId = '123';
const authUrl = 'https://somehost';
const token = 'someToken';

describe('validate token', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should return userId if status 200', async () => {
        mockFetch.mockResolvedValue({
            text: () => Promise.resolve(userId),
            status: 200,
        } as Awaited<ReturnType<typeof fetch>>);
        expect(await validate(authUrl, token)).toBe(userId);
        expect(mockFetch).toHaveBeenCalledWith(`${authUrl}/validate`, {
            method: 'post',
            body: token,
            headers: { 'Content-Type': 'text/plain' },
        });
    });

    it('should return null if status 401', async () => {
        mockFetch.mockResolvedValue({
            text: async () => { throw new Error('this should not be read'); },
            status: 401,
        } as unknown as Awaited<ReturnType<typeof fetch>>);
        expect(await validate(authUrl, token)).toBeNull();
    });

    it('should throw if status is not 401 or 200', async () => {
        mockFetch.mockResolvedValue({
            text: async () => { throw new Error('this should not be read'); },
            status: 500,
        } as unknown as Awaited<ReturnType<typeof fetch>>);
        await expect(validate(authUrl, token)).rejects.toStrictEqual(expect.anything());
    });
});
