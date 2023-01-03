import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

import { diffLines } from 'diff';

import { Context } from '../@types/Context';
import { getTemplateFileHash } from './files';

export type FileDiffItem = {
    filename: string,
    missing: boolean,
    hidden: boolean,
    changes: number,
    added: number,
    removed: number,
}

export class FileDiff {
    private context: Context;
    private filenames: string[];

    private diffs: FileDiffItem[] = [];

    constructor(context: Context, filenames: string[]) {
        this.context = context;
        this.filenames = filenames;

        for (const file of this.filenames)
            this.diffs.push(this.getWorkingFileDiff(file))

        this.maintain();
    }

    public count(): number { return this.diffs.length; }

    public getAll(): FileDiffItem[] { return this.diffs; }

    public getByFilename(filename: string): FileDiffItem | undefined { return this.diffs.find(d => d.filename === filename); }

    public updateFile(filename: string) {
        if (!this.filenames.includes(filename))
            return;

        this.diffs = this.diffs.filter(d => d.filename !== filename);
        this.diffs.push(this.getWorkingFileDiff(filename));

        this.maintain();
    }

    private maintain() {
        if (this.diffs.length === 0)
            return;
        this.diffs = this.diffs.filter(d => d.missing || d.removed > 0);
        this.diffs.sort((a, b) => a.filename.localeCompare(b.filename));
    }

    private getWorkingFileDiff(filename: string): FileDiffItem {
        const workingFilename = join(this.context.workingFolder, this.context.getWorkingFilename(filename));
        if (existsSync(workingFilename)) {
            const tmplFilename = join(this.context.templateFolder, filename);

            let tmplFile = readFileSync(tmplFilename).toString();
            if (!this.context.commandLine.hidden) {
                const hfItem = this.context.config.hiddenFiles.find(hf => hf.filename === filename);
                if (hfItem && hfItem.hash === getTemplateFileHash(this.context.templateFolder, filename))
                    return {
                        filename,
                        missing: false,
                        hidden: false,
                        added: 0,
                        removed: 0,
                        changes: 0,
                    }
            }
            const workingFile = readFileSync(workingFilename).toString();

            if (this.context.config.templateId && this.context.config.repoId)
                while (tmplFile.includes(this.context.config.templateId))
                    tmplFile = tmplFile.replace(this.context.config.templateId, this.context.config.repoId);

            const changes = diffLines(tmplFile, workingFile, {
                ignoreWhitespace: true,
                newlineIsToken: false
            }).filter(c => c.added || c.removed);

            return {
                filename: filename,
                missing: false,
                hidden: this.context.config.hiddenFiles.some(hf => hf.filename === filename),
                changes: changes.length,
                added: changes.filter(c => c.added).length,
                removed: changes.filter(c => c.removed).length,
            }
        }
        else {
            if (!this.context.commandLine.hidden) {
                const hfItem = this.context.config.hiddenFiles.find(hf => hf.filename === filename);
                if (hfItem && hfItem.hash === getTemplateFileHash(this.context.templateFolder, filename))
                    return {
                        filename,
                        missing: false,
                        hidden: false,
                        added: 0,
                        removed: 0,
                        changes: 0,
                    }
            }
            return {
                filename: filename,
                missing: true,
                hidden: this.context.config.hiddenFiles.some(hf => hf.filename === filename),
                changes: 0, added: 0, removed: 0
            }
        }
    }
}
