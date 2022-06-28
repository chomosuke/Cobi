import request from 'supertest';
import { PrismaClient } from '../prisma';
import { Context } from '../src/context';
import { constructApp } from '../src/constructApp';
import { compare, hash } from '../src/hash';

type Update = PrismaClient['user']['update'];
type FindUnique = PrismaClient['user']['findUnique'];
const mockContext = {
    secret: undefined,
    prisma: {
        user: {
            findUnique: jest.fn<Promise<{ password: string } | null>, Parameters<FindUnique>>(),
            update: jest.fn<Promise<{ id: number }>, Parameters<Update>>(),
        },
    },
    debug: true,
};

const payload = { userId: 123, currentPassword: 'somehash', newPassword: 'someOtherHash' };

describe('changePassword', () => {
    beforeEach(() => {
        mockContext.prisma.user.findUnique.mockReset();
        mockContext.prisma.user.update.mockReset();
    });

    it('should change password & return 200 if currentPassword is correct', async () => {
        const { userId, currentPassword, newPassword } = payload;
        mockContext.prisma.user.findUnique.mockResolvedValue({
            // return the hash of currentPassword so that it matches
            password: await hash(currentPassword),
        });
        mockContext.prisma.user.update.mockResolvedValue({
            id: userId,
        });
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/change-password')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalled();
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalledWith({
            select: { password: true },
            where: { id: userId },
        });
        expect(mockContext.prisma.user.update).toHaveBeenCalled();
        // forloop to be truthful to 'can be call many times'
        for (const args of mockContext.prisma.user.update.mock.calls) {
            // to make the next expect safe
            expect(typeof args[0].data.password).toBe('string');
            // should save the hashed password
            // eslint-disable-next-line no-await-in-loop
            expect(await compare(
                newPassword,
                args[0].data.password as string,
            )).toBeTruthy();
            // rest of the args
            expect(args[0].select?.id).toBe(true);
        }
    });

    it('should return 404 if userId not found', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/change-password')
            .send(payload);
        expect(res.statusCode).toBe(404);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalled();
        expect(mockContext.prisma.user.update).not.toHaveBeenCalled();
    });

    it('should return 401 if currentPassword is incorrect', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue({
            // hash of something else so it wouldn't match
            password: await hash('something else'),
        });
        const res = await request(constructApp(mockContext as unknown as Context))
            .patch('/change-password')
            .send(payload);
        expect(res.statusCode).toBe(401);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalled();
        expect(mockContext.prisma.user.update).not.toHaveBeenCalled();
    });
});
