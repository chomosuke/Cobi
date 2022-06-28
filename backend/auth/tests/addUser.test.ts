import request from 'supertest';
import { PrismaClient } from '../prisma';
import { Context } from '../src/context';
import { constructApp } from '../src/constructApp';
import { compare } from '../src/hash';

type Create = PrismaClient['user']['create'];
const mockContext = {
    secret: undefined,
    prisma: {
        user: {
            create: jest.fn<Promise<{ id: number }>, Parameters<Create>>(),
        },
    },
    debug: true,
};

const payload = { password: 'somehash' };

describe('addUser', () => {
    beforeEach(() => {
        mockContext.prisma.user.create.mockReset();
    });

    it('should return userId and add userId-password to DB', async () => {
        const { password } = payload;
        const userId = 10;
        mockContext.prisma.user.create.mockResolvedValue({
            id: userId,
        });
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/add-user')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(userId.toString());
        expect(mockContext.prisma.user.create).toHaveBeenCalledTimes(1);
        const args = mockContext.prisma.user.create.mock.calls[0];
        // should save the hashed password
        expect(await compare(
            password,
            args[0].data.password,
        )).toBeTruthy();
        // rest of the args
        expect(args[0].select?.id).toBe(true);
    });
});
