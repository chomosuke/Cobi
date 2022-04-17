import request from 'supertest';
import { searchDB } from '../../src/account/search/searchDB';
import { constructApp } from '../../src/constructApp';
import { Context } from '../../src/context';

jest.mock('../../src/account/search/searchDB');
const mockSearchDB = searchDB as jest.MockedFunction<typeof searchDB>;

const mockContext = {
    debug: true,
    authUrl: undefined,
    prisma: 'prisma',
};

describe('search user', () => {
    beforeEach(() => {
        mockSearchDB.mockReset();
    });

    it('should return a list of ids returned by search()', async () => {
        const userIds = [1, 2, 3];
        const username = 'username';
        mockSearchDB.mockResolvedValue(userIds);
        const res = await request(constructApp(mockContext as unknown as Context))
            .get(`/api/account/search?username=${username}`);
        expect(res.statusCode).toBe(200);
        expect(mockSearchDB).toHaveBeenCalledWith(mockContext.prisma, username);
        expect(res.body).toStrictEqual(userIds.map((id) => id.toString()));
    });
});
