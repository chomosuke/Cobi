import request from 'supertest';
import { PrismaClient } from '../prisma';
import { Context } from '../src/context';
import { constructApp } from '../src/constructApp';
import { compare } from '../src/hash';

type Create = PrismaClient['user']['create'];
const mockContext = {
    secret: 'secret',
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
        expect(res.text).toBe(userId.toString());
        expect(res.statusCode).toBe(200);
        expect(mockContext.prisma.user.create).toHaveBeenCalledTimes(1);
        expect(await compare(
            password,
            mockContext.prisma.user.create.mock.calls[0][0].data.password,
        )).toBeTruthy();
        expect(
            mockContext.prisma.user.create.mock.calls[0][0].select?.id,
        ).toBe(true);
    });
});
