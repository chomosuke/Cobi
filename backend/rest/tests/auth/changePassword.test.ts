import fetch from 'node-fetch';
import { changePassword } from '../../src/auth/changePassword';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const payload = { userId: 1, currentPassword: 'somehash', newPassword: 'newhash' };
const authUrl = 'https://somehost';

describe('add user', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should return true if auth service returned 200', async () => {
        mockFetch.mockResolvedValue({
            status: 200,
        } as Awaited<ReturnType<typeof fetch>>);
        expect(await changePassword(authUrl, payload)).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(`${authUrl}/change-password`, {
            method: 'patch',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
        });
    });

    it('should turn false if auth service return 401', async () => {
        mockFetch.mockResolvedValue({
            status: 401,
        } as Awaited<ReturnType<typeof fetch>>);
        expect(await changePassword(authUrl, payload)).toBe(false);
        expect(mockFetch).toHaveBeenCalledWith(`${authUrl}/change-password`, {
            method: 'patch',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
        });
    });

    it('should throw if status is not 401 or 200', async () => {
        mockFetch.mockResolvedValue({
            status: 500,
        } as unknown as Awaited<ReturnType<typeof fetch>>);
        await expect(changePassword(authUrl, payload)).rejects.toStrictEqual(expect.anything());
    });
});
