import express, { IRouter } from 'express';
import { authenticate } from '../auth/authenticate';
import { Context, contextAsyncHandler } from '../context';
import { getAll } from './getAll';

export function routeChat(context: Context, api: IRouter) {
    const chats = express.Router();
    api.use('/chats', chats);
    chats.get('', authenticate(context), contextAsyncHandler(context, getAll));
}
