/* eslint-disable no-restricted-syntax */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../prisma';
import { Context } from '../src/context';
import { constructApp } from '../src/constructApp';

jest.mock('jsonwebtoken');
const jwtSign = jwt.sign as jest.MockedFunction<
(
    token: string,
    secretOrPublicKey: jwt.Secret,
    options?: jwt.VerifyOptions,
) => Record<string, unknown> | string
>;

type FindUnique = PrismaClient['users']['findUnique'];
const mockContext = {
    secret: 'secret',
    prisma: {
        users: {
            findUnique: jest.fn<ReturnType<FindUnique>, Parameters<FindUnique>>(),
        },
    },
};
const payload = { username: 'username', password: 'somehash' };

describe('parse', () => {
    beforeEach(() => {
        mockContext.prisma.users.findUnique.mockReset();
    });

    it('should return 401 if no user found with username & password', async () => {
        mockContext.prisma.users.findUnique.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/parse')
            .send(payload);
        expect(res.statusCode).toBe(401);
        expect(mockContext.prisma.users.findUnique).toHaveBeenCalledWith({ where: payload });
    });

    it('should return correct jwt if userId found', async () => {
        const userId = 123;
        mockContext.prisma.users.findUnique.mockResolvedValue({
            ...payload,
            id: userId,
        });
        const token = 'jwt';
        jwtSign.mockReturnValue(token);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/parse')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(token);
        expect(mockContext.prisma.users.findUnique).toHaveBeenCalledWith({ where: payload });
        expect(jwtSign).toHaveBeenCalledWith(userId.toString(), mockContext.secret);
    });
});
