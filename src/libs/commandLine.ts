import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

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
        .version('v', 'Version number', '0.1.2')
        .help('h', 'Show this help')
        .argv;
}