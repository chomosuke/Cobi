/* eslint-disable no-restricted-syntax */
import request from 'supertest';
import jwt, {
    JsonWebTokenError, JwtPayload, Secret, VerifyOptions,
} from 'jsonwebtoken';
import { Context } from '../src/context';
import { constructApp } from '../src/constructApp';

jest.mock('jsonwebtoken');
const jwtVerify = jwt.verify as unknown as jest.MockedFunction<
(
    token: string,
    secretOrPublicKey: Secret,
    options?: VerifyOptions & { complete?: false }
) => JwtPayload | string
>;

const mockContext = {
    secret: 'secret',
    prisma: undefined,
    debug: true,
};

describe('validate', () => {
    beforeEach(() => {
        jwtVerify.mockReset();
    });

    it('should return 401 if unable to verify', async () => {
        jwtVerify.mockImplementation(() => {
            throw new JsonWebTokenError('some error');
        });
        const token = 'token';
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/validate')
            .set('Content-type', 'text/plain')
            .send(token);
        expect(res.statusCode).toBe(401);
    });

    it('should return userId if able to verify', async () => {
        const userId = 'userId';
        jwtVerify.mockReturnValue({ userId });
        const token = 'token';
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/validate')
            .set('Content-type', 'text/plain')
            .send(token);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(userId);
    });

    it('should use jwt.verify with correct parameters', async () => {
        const token = 'token';
        await request(constructApp(mockContext as unknown as Context))
            .post('/validate')
            .set('Content-type', 'text/plain')
            .send('token');
        expect(jwtVerify).toHaveBeenCalledWith(token, mockContext.secret, { maxAge: '1y' });
    });

    it('should rethrow error that is not JsonWebTokenError', async () => {
        const error = new Error('some error');
        jwtVerify.mockImplementation(() => {
            throw error;
        });
        const token = 'token';
        const res = await request(constructApp(mockContext as unknown as Context))
            .post('/validate')
            .set('Content-type', 'text/plain')
            .send(token);
        expect(res.statusCode).toBe(500);
    });
});
