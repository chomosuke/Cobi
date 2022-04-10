import bodyParser from 'body-parser';
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import path from 'path/posix';
import expressAsyncHandler from 'express-async-handler';
import { parse } from './parse';
import { Context } from './context';
import { validate } from './validate';

export function constructApp(context: Context) {
    const app = express();

    const api = express.Router({ strict: true });
    app.use('', api);
    api.use(bodyParser.text());
    api.use(bodyParser.json());
    api.use(OpenApiValidator.middleware({
        apiSpec: path.join(__dirname, '../api.yml'),
    }));

    api.post('/parse', expressAsyncHandler((req, res) => parse(context, req, res)));

    api.post('/validate', expressAsyncHandler((req, res) => validate(context, req, res)));

    return app;
}
