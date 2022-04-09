import express, { IRouter } from 'express';

export function routeContact(app: IRouter) {
    const contacts = express.Router();
    app.use('/contacts', contacts);
    contacts.get('');
    const contact = express.Router();
    app.use('/contact', contact);
    contact.get('/:userId');
    contact.delete('/:userId');
    contact.post('/block');
    contact.get('/invites/outgoing');
    contact.get('/invite/outgoing');
    contact.get('/invites/incoming');
    contact.get('/invite/incoming/:userId');
}
