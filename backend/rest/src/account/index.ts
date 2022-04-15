import express, { IRouter } from 'express';
import { authenticate } from '../auth/authenticate';
import { Context, contextAsyncHandler } from '../context';
import { get } from './get';
import { login } from './login';
import { patch } from './patch';
import { register } from './register';
import { search } from './search';

export function routeAccount(context: Context, api: IRouter) {
    const account = express.Router();
    api.use('/account', account);
    account.post('/login', contextAsyncHandler(context, login));
    account.post('/register', contextAsyncHandler(context, register));
    account.get('', authenticate(context), contextAsyncHandler(context, get));
    account.patch('', authenticate(context), contextAsyncHandler(context, patch));
    account.get('/search', contextAsyncHandler(context, search));
    account.get('/:userId');
    account.get('/profile-picture');
    account.put('/profile-picture');
    account.delete('/profile-picture');
    account.get('/profile-picture/:userId');
}
