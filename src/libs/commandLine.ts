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
            alias: 'h',
            description: 'Show hidden files',
            boolean: true,
            default: false,
        })
        .version('version')
        .help('help', 'Show this help')
        .argv;
}