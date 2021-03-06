import { NextFunction, Request, Response } from 'express';
import bearerToken from 'express-bearer-token';
import { Context, contextAsyncHandler } from '../context';
import { validateToken } from './validateToken';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        export interface Request {
            userId: number;
        }
    }
}

export function authenticate(
    context: Context,
) {
    return [
        bearerToken(),
        contextAsyncHandler(context, authenticateWithToken),
    ];
}

async function authenticateWithToken(
    context: Context,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { token } = req;
    if (token === undefined) {
        res.sendStatus(401);
        return;
    }
    const userId = await validateToken(context.authUrl, token);
    if (userId === null) {
        res.sendStatus(401);
        return;
    }
    req.userId = userId;
    next();
}
