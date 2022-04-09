import express, { IRouter } from 'express';

export function routeMessage(api: IRouter) {
    const messages = express.Router();
    api.use('/messages/:chatId', messages);
    messages.get('/older-than/:messageId');
    messages.get('/newer-than/:messageId');
    messages.get('/newest');
    const message = express.Router();
    api.use('/message/:chatId', message);
    message.get('/:messageId');
    message.post('');
}
