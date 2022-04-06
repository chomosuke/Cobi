import express from 'express';
import { Command } from 'commander';
import { z } from 'zod';

// command line args
const program = new Command();
program
    .option('-p, --port <number', 'the port this server will listen on', '80');
program.parse();
const options = program.opts();
const port = z.string().parse(options['port']);

const app = express();

app.get('/', (_req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`);
});
