import express, { IRouter } from 'express';
import { authenticate } from '../auth/authenticate';
import { Context, contextAsyncHandler } from '../context';
import { get } from './get';
import { getOther } from './getOther';
import { login } from './login';
import { patch } from './patch';
import { profilePictureGet } from './profilePictureGet';
import { profilePicturePut } from './profilePicturePut';
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
    account.get('/profile-picture', authenticate(context), contextAsyncHandler(context, profilePictureGet));
    account.put('/profile-picture', authenticate(context), contextAsyncHandler(context, profilePicturePut));
    account.delete('/profile-picture');
    account.get('/profile-picture/:userId');

    // have to be at the end because otherwise would catch /profile-picture & return 404
    account.get('/:userId', contextAsyncHandler(context, getOther));
}
