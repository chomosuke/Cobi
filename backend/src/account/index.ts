import express, { IRouter } from 'express';

export function routeAccount(app: IRouter) {
    const account = express.Router();
    app.use('/account', account);
    account.post('/login');
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
