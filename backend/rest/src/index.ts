import { Command } from 'commander';
import { z } from 'zod';
import { PrismaClient } from '../prisma';
import { constructApp } from './constructApp';

// command line args
const program = new Command();
program
    .option('-p, --port <number>', 'the port this server will listen on')
    .option('-a, --authUrl <string>', 'the url for the auth server');
program.parse();
const options = program.opts();
const port = z.string().parse(options['port']);
const authUrl = z.string().parse(options['authUrl']);

constructApp({ prisma: new PrismaClient(), authUrl }).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`);
});
