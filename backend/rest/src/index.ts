import bodyParser from 'body-parser';
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import { Command } from 'commander';
import { z } from 'zod';
import path from 'path/posix';
import { routeAccount } from './account';
import { routeContact } from './contact';
import { routeMessage } from './message';

// command line args
const program = new Command();
program
    .option('-p, --port <number>', 'the port this server will listen on', '80');
program.parse();
const options = program.opts();
const port = z.string().parse(options['port']);

const app = express();

const api = express.Router({ strict: true });
app.use('/api', api);
api.use(bodyParser.text());
api.use(bodyParser.json());
api.use(OpenApiValidator.middleware({
    apiSpec: path.join(__dirname, '../api.yml'),
}));
routeAccount(api);
routeContact(api);
routeMessage(api);

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`);
});
