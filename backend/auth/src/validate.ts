import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { Context } from './context';
import { ValidateReq } from './api';

export function validate(context: Context, req: Request, res: Response) {
    // eslint-disable-next-line no-restricted-syntax
    const token = req.body as ValidateReq;
    let userId;
    try {
        userId = jwt.verify(token, context.secret, { maxAge: '1y' });
    } catch (e) {
        res.sendStatus(401);
        return;
    }
    res.send(userId);
}
