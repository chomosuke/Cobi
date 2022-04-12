import express, { IRouter } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { Context } from '../context';
import { register } from './register';

export function routeAccount(context: Context, api: IRouter) {
    const account = express.Router();
    api.use('/account', account);
    account.post('/login');
    account.post('/register', expressAsyncHandler((req, res) => register(context, req, res)));
    account.get('');
    account.patch('');
    account.get('/search');
    account.get('/:userId');
    account.get('/profile-picture');
    account.put('/profile-picture');
    account.delete('/profile-picture');
    account.get('/profile-picture/:userId');
}
