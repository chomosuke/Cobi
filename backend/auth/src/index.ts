import bodyParser from 'body-parser';
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import { Command } from 'commander';
import { z } from 'zod';
import path from 'path/posix';
import { ParseReq } from './api';

// command line args
const program = new Command();
program
    .option('-p, --port <number>', 'the port this server will listen on')
    .option('-s, --secret <string>', 'server secret');
program.parse();
const options = program.opts();
const port = z.string().parse(options['port']);
const _secret = z.string().parse(options['secret']);

const app = express();

const api = express.Router({ strict: true });
app.use('', api);
api.use(bodyParser.text());
api.use(bodyParser.json());
api.use(OpenApiValidator.middleware({
    apiSpec: path.join(__dirname, '../api.yml'),
}));
api.post('/parse', (req, _res) => {
    // eslint-disable-next-line no-restricted-syntax
    const _body = req.body as ParseReq;
});
api.post('/validate', (_req, _res) => {

});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`);
});
