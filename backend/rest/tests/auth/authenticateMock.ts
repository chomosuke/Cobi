/* eslint-disable no-restricted-syntax */
import { authenticate } from '../../src/auth/authenticate';
import { Context } from '../../src/context';

jest.mock('../../src/auth/authenticate');
export const authenticateMock = authenticate as jest.MockedFunction<typeof authenticate>;

export const userId = 123;

authenticateMock.mockImplementation((_context: Context) => [(req, _res, next) => {
    req.userId = userId;
    next();
}]);
