import bodyParser from 'body-parser';
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import path from 'path/posix';
import expressAsyncHandler from 'express-async-handler';
import { getToken } from './getToken';
import { Context } from './context';
import { validateToken } from './validateToken';
import { addUser } from './addUser';

export function constructApp(context: Context) {
    const app = express();

    const api = express.Router({ strict: true });
    app.use('', api);
    api.use(bodyParser.text());
    api.use(bodyParser.json());
    api.use(OpenApiValidator.middleware({
        apiSpec: path.join(__dirname, '../api.yml'),
        validateResponses: context.debug,
    }));

    api.post('/validate-token', expressAsyncHandler(
        (req, res) => validateToken(context, req, res),
    ));
    api.post('/get-token', expressAsyncHandler(
        (req, res) => getToken(context, req, res),
    ));
    api.post('/add-user', expressAsyncHandler(
        (req, res) => addUser(context, req, res),
    ));

    return app;
}
