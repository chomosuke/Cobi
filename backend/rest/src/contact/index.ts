import express, { IRouter } from 'express';
import { authenticate } from '../auth/authenticate';
import { Context, contextAsyncHandler } from '../context';
import { delete$ } from './delete';
import { get } from './get';
import { getAll } from './getAll';
import { getInvitesOutgoing } from './getInvitesOutgoing';

export function routeContact(context: Context, api: IRouter) {
    const contacts = express.Router();
    api.use('/contacts', contacts);
    contacts.get('', authenticate(context), contextAsyncHandler(context, getAll));
    const contact = express.Router();
    api.use('/contact', contact);
    contact.get('/:userId', authenticate(context), contextAsyncHandler(context, get));
    contact.delete('/:userId', authenticate(context), contextAsyncHandler(context, delete$));
    contact.get('/invites/outgoing', authenticate(context), contextAsyncHandler(context, getInvitesOutgoing));
    contact.post('/invite/outgoing', authenticate(context));
    contact.get('/invites/incoming', authenticate(context));
    contact.post('/invite/incoming/:userId', authenticate(context));
}
