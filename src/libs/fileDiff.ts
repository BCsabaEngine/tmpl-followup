import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

import { diffLines } from 'diff';

import { Context } from '../@types/Context';

export type FileDiff = {
    filename: string,
    missing: boolean,
    changes: number,
    added: number,
    removed: number,
}

export const getWorkingFileDiff = (context: Context, file: string): FileDiff => {
    const workingFilename = join(context.workingFolder, file);
    if (existsSync(workingFilename)) {
        const tmplFilename = join(context.templateFolder, file);

        const tmplFile = readFileSync(tmplFilename).toString();
        const workingFile = readFileSync(workingFilename).toString();
        const changes = diffLines(tmplFile, workingFile, {
            ignoreWhitespace: true,
            newlineIsToken: false
        }).filter(c => c.added || c.removed);

        return {
            filename: file,
            changes: changes.length,
            added: changes.filter(c => c.added).length,
            removed: changes.filter(c => c.removed).length,
            missing: false
        }
    }
    else
        return {
            filename: file,
            missing: true,
            changes: 0, added: 0, removed: 0
        }
}

export const getWorkingFilesDiff = (context: Context, files: string[]): FileDiff[] => {
    const diffs: FileDiff[] = [];

    for (const file of files)
        diffs.push(getWorkingFileDiff(context, file));

    return diffs.filter(d => d.missing || d.changes > 0);
}