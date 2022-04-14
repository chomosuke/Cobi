/* eslint-disable no-restricted-syntax */
import { authenticate } from '../../src/auth/authenticate';
import { Context } from '../../src/context';

export function mockAuthenticate(userId: number) {
    return (_context: Context): ReturnType<typeof authenticate> => [(req, _res, next) => {
        req.userId = userId;
        next();
    }];
}
