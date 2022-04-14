import bodyParser from 'body-parser';
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import path from 'path/posix';
import { Context } from './context';
import { routeAccount } from './account';
import { routeContact } from './contact';
import { routeMessage } from './message';

export function constructApp(context: Context) {
    const app = express();

    const api = express.Router({ strict: true });
    app.use('/api', api);
    api.use(bodyParser.text());
    api.use(bodyParser.json());
    api.use(OpenApiValidator.middleware({
        apiSpec: path.join(__dirname, '../api.yml'),
        validateResponses: context.debug,
    }));
    routeAccount(context, api);
    routeContact(context, api);
    routeMessage(context, api);

    return app;
}
