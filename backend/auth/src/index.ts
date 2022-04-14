import { Command } from 'commander';
import { z } from 'zod';
import { PrismaClient } from '../prisma';
import { constructApp } from './constructApp';

// command line args
const program = new Command();
program
    .option('-p, --port <number>', 'the port this server will listen on')
    .option('-s, --secret <string>', 'server secret')
    .option('-d, --debug', 'debug mode', false);
program.parse();
const options = program.opts();
const port = z.string().parse(options['port']);
const secret = z.string().parse(options['secret']);
const debug = z.boolean().parse(options['debug']);

const prisma = new PrismaClient();

const app = constructApp({ secret, prisma, debug });

void prisma.$connect();

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`);
});
