import request from 'supertest';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '../prisma';
import { Context } from '../src/context';
import { constructApp } from '../src/constructApp';
import { hash } from '../src/hash';

jest.mock('jsonwebtoken');
const jwtSign = jwt.sign as jest.MockedFunction<
(
    payload: string | Buffer | object,
    secretOrPrivateKey: Secret,
    options?: SignOptions,
) => string
>;

type FindUnique = PrismaClient['user']['findUnique'];
const mockContext = {
    secret: 'secret',
    prisma: {
        user: {
            findUnique: jest.fn<Promise<{ password: string } | null>, Parameters<FindUnique>>(),
        },
    },
    debug: true,
};

const payload = { userId: 123, password: 'somehash' };

describe('getToken', () => {
    beforeEach(() => {
        mockContext.prisma.user.findUnique.mockReset();
        jwtSign.mockReset();
    });

    it('should return correct jwt if userId found & password correct', async () => {
        const { userId, password } = payload;
        mockContext.prisma.user.findUnique.mockResolvedValue({
            password: await hash(password),
        });
        const token = 'jwt';
        jwtSign.mockReturnValue(token);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/get-token')
            .send(payload);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(token);
        expect(mockContext.prisma.user.findUnique).toHaveBeenCalledWith({
            where: {
                id: payload.userId,
            },
            select: {
                password: true,
            },
        });
        expect(jwtSign).toHaveBeenCalledWith({ userId: userId.toString() }, mockContext.secret);
    });

    it('should return 401 if password hashes doesn\'t match', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue({
            password: await hash('another password'),
        });
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/get-token')
            .send(payload);
        expect(res.statusCode).toBe(401);
    });

    it('should return 401 if user with userId is not found', async () => {
        mockContext.prisma.user.findUnique.mockResolvedValue(null);
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/get-token')
            .send(payload);
        expect(res.statusCode).toBe(401);
    });
});
