/* eslint-disable no-restricted-syntax */
import { Request, Response } from 'express';
import { validate } from '../../src/auth/validate';
import { authenticate } from '../../src/auth/authenticate';
import { Context } from '../../src/context';

jest.mock('../../src/auth/validate');
const mockValidate = validate as jest.MockedFunction<typeof validate>;
const next = jest.fn<void, []>();

const mockReq: {
    token: string;
    userId?: number;
} = {
    token: 'someToken',
};

const mockContext = {
    authUrl: 'https://somehost',
    prisma: undefined,
    debug: true,
};

const sendStatus = jest.fn<unknown, [number]>();
function mockRes(res: (value: void | PromiseLike<void>) => void) {
    return {
        sendStatus: (status: number) => { sendStatus(status); res(); },
    };
}

const authenticateWithToken = authenticate(mockContext as unknown as Context)[1];

describe('authenticate middleware', () => {
    beforeEach(() => {
        next.mockReset();
        mockValidate.mockReset();
        sendStatus.mockReset();
    });

    it('should call next if authenticated', async () => {
        const userId = '123';
        mockValidate.mockResolvedValue(userId);
        await new Promise<void>((res, _rej) => {
            authenticateWithToken(
                mockReq as unknown as Request,
                mockRes(res) as unknown as Response,
                () => { next(); res(); },
            );
        });
        expect(next).toHaveBeenCalledTimes(1);
        expect(mockReq.userId).toBe(parseInt(userId, 10));
        expect(sendStatus).not.toHaveBeenCalled();
        expect(mockValidate).toHaveBeenCalledWith(mockContext.authUrl, mockReq.token);
    });

    it('should return 401 if validate failed', async () => {
        mockValidate.mockResolvedValue(null);
        await new Promise<void>((res, _rej) => {
            authenticateWithToken(
                mockReq as unknown as Request,
                mockRes(res) as unknown as Response,
                () => { next(); res(); },
            );
        });
        expect(next).not.toHaveBeenCalled();
        expect(sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 401 if token is undefined', async () => {
        await new Promise<void>((res, _rej) => {
            authenticateWithToken(
                {} as unknown as Request,
                mockRes(res) as unknown as Response,
                () => { next(); res(); },
            );
        });
        expect(mockValidate).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(sendStatus).toHaveBeenCalledWith(401);
    });
});
