import express, { IRouter } from 'express';

export function routeAccount(api: IRouter) {
    const account = express.Router();
    api.use('/account', account);
    account.post('/login', (_req, res) => {
        res.send('hello world');
    });
    account.post('/register');
    account.get('');
    account.patch('');
    account.get('/search');
    account.get('/:userId');
    account.get('/profile-picture');
    account.put('/profile-picture');
    account.delete('/profile-picture');
    account.get('/profile-picture/:userId');
}
