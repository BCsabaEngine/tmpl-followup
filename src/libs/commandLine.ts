import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { appVersion } from '../version';

export const commandLine = async () => {
    return yargs(hideBin(process.argv))
        .option('folder', {
            alias: 'f',
            description: 'Working folder',
            string: true,
            default: '.',
        })
        .option('hidden', {
            description: 'Show hidden files',
            boolean: true,
            default: false,
        })
        .version('v', 'Version number', appVersion)
        .help('h', 'Show this help')
        .argv;
}