import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

import { sync as globsync } from 'glob';

import { Context } from '../@types/Context';
import { ignoreFile } from './ignoreFile';

export const getTemplateFiles = (context: Context): string[] => {
    let files = globsync('**', {
        cwd: context.templateFolder,
        nodir: true,
        nosort: true,
    });
    files = ignoreFile(context.config.exclude, files)
    files.sort();

    return files;
}

export const copyFromTemplate = (context: Context, filename: string) => {
    const content = readFileSync(join(context.templateFolder, filename));

    const workingFileName = join(context.workingFolder, filename);
    const workingFolder = dirname(workingFileName);
    mkdirSync(workingFolder, { recursive: true });
    writeFileSync(workingFileName, content);
}
