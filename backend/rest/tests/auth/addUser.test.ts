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
});
