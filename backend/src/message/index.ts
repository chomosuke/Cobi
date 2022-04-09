import express, { IRouter } from 'express';

export function routeMessage(app: IRouter) {
    const messages = express.Router();
    app.use('/messages/:chatId', messages);
    messages.get('/older-than/:messageId');
    messages.get('/newer-than/:messageId');
    messages.get('/newest');
    const message = express.Router();
    app.use('/message/:chatId', message);
    message.get('/:messageId');
    message.post('');
}
