import express, { IRouter } from 'express';
import { Context, contextAsyncHandler } from '../context';
import { login } from './login';
import { register } from './register';

export function routeAccount(context: Context, api: IRouter) {
    const account = express.Router();
    api.use('/account', account);
    account.post('/login', contextAsyncHandler(context, login));
    account.post('/register', contextAsyncHandler(context, register));
    account.get('');
    account.patch('');
    account.get('/search');
    account.get('/:userId');
    account.get('/profile-picture');
    account.put('/profile-picture');
    account.delete('/profile-picture');
    account.get('/profile-picture/:userId');
}
