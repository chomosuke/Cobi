import express, { IRouter } from 'express';
import { authenticate } from '../auth/authenticate';
import { Context, contextAsyncHandler } from '../context';
import { get } from './get';
import { getAll } from './getAll';

export function routeContact(context: Context, api: IRouter) {
    const contacts = express.Router();
    api.use('/contacts', contacts);
    contacts.get('', authenticate(context), contextAsyncHandler(context, getAll));
    const contact = express.Router();
    api.use('/contact', contact);
    contact.get('/:userId', authenticate(context), contextAsyncHandler(context, get));
    contact.delete('/:userId');
    contact.post('/block');
    contact.get('/invites/outgoing');
    contact.get('/invite/outgoing');
    contact.get('/invites/incoming');
    contact.get('/invite/incoming/:userId');
}
