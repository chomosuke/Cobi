import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { z } from 'zod';
import { Context } from './context';
import { ValidateReq } from './apiTypes/api';

export function validate(context: Context, req: Request, res: Response) {
    // eslint-disable-next-line no-restricted-syntax
    const token = req.body as ValidateReq;
    let userId;
    try {
        userId = z.object({ userId: z.string() }).parse(
            jwt.verify(token, context.secret, { maxAge: '1y' }),
        ).userId;
    } catch (e) {
        if (e instanceof JsonWebTokenError) {
            res.sendStatus(401);
            return;
        }
        throw e;
    }
    res.send(userId);
}
