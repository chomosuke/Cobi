import fetch from 'node-fetch';
import { addUser } from '../../src/auth/addUser';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const payload = { password: 'somehash' };
const userId = 123;
const authUrl = 'https://somehost';

describe('add user', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should return userId', async () => {
        mockFetch.mockResolvedValue({
            text: () => Promise.resolve(userId.toString()),
            status: 200,
        } as Awaited<ReturnType<typeof fetch>>);
        expect(await addUser(authUrl, payload)).toBe(userId);
        expect(mockFetch).toHaveBeenCalledWith(`${authUrl}/add-user`, {
            method: 'post',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
        });
    });

    it('should throw if status is not 200', async () => {
        mockFetch.mockResolvedValue({
            text: async () => { throw new Error('this should not be read'); },
            status: 500,
        } as unknown as Awaited<ReturnType<typeof fetch>>);
        await expect(addUser(authUrl, payload)).rejects.toStrictEqual(expect.anything());
    });
});
