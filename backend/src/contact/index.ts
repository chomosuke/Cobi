import express, { IRouter } from 'express';

export function routeContact(api: IRouter) {
    const contacts = express.Router();
    api.use('/contacts', contacts);
    contacts.get('');
    const contact = express.Router();
    api.use('/contact', contact);
    contact.get('/:userId');
    contact.delete('/:userId');
    contact.post('/block');
    contact.get('/invites/outgoing');
    contact.get('/invite/outgoing');
    contact.get('/invites/incoming');
    contact.get('/invite/incoming/:userId');
}
