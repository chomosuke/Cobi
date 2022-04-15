import { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { PrismaClient } from '../prisma/index';

export interface Context {
    prisma: PrismaClient;
    authUrl: string;
    debug: boolean;
}

export function contextAsyncHandler(
    context: Context,
    handler: (context: Context, req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
    return expressAsyncHandler(
        (req, res, next) => handler(context, req, res, next),
    );
}
