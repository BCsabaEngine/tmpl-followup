import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { createHash } from 'node:crypto';

import { Context } from '../@types/Context';
import { isFileIgnored } from './ignoreFile';

const getAllFiles = function (directoryPath: string, arrayOfFiles: string[], ignoreMask: string[] = []) {
    const files = readdirSync(directoryPath);

    for (const file of files) {
        if (file.startsWith('.git'))
            continue;
        const filename = join(directoryPath + sep, file);
        if (isFileIgnored(ignoreMask, filename))
            continue;
        if (statSync(filename).isDirectory()) {
            arrayOfFiles = getAllFiles(filename, arrayOfFiles, ignoreMask);
        } else {
            arrayOfFiles.push(filename);
        }
    }

    return arrayOfFiles;
}

export const getTemplateFiles = (context: Context): string[] => {
    let files = getAllFiles(context.templateFolder, [], context.config.exclude);
    files = files.map(f => {
        if (f.startsWith(context.templateFolder + '/'))
            return f.slice(context.templateFolder.length + 1);
        return f;
    })
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

export const getTemplateFileHash = (templateFolder: string, filename: string) => {
    const content = readFileSync(join(templateFolder, filename));
    return createHash('md5').update(content).digest('hex');
}
