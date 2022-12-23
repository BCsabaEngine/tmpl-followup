import { FileDiffItem } from './FileDiff';

// eslint-disable-next-line @typescript-eslint/no-var-requires, unicorn/prefer-module
const { Select } = require('enquirer');

const SEP = '…';

export const fileSelectToProcess = async (fileDiffs: FileDiffItem[]): Promise<string | undefined> => {
    const diffStateToDisplay = fileDiffs.map(fd => {
        const infos = [];
        if (fd.missing)
            infos.push('new');
        else {
            if (fd.added)
                infos.push(`+${fd.added}`);
            if (fd.removed)
                infos.push(`-${fd.removed}`);
        }
        return `${fd.filename}${SEP} (${infos.join('')})`;
    }).sort();

    const prompt = new Select({
        name: 'file',
        message: 'Select a file to process',
        choices: diffStateToDisplay,
    });

    try {
        const answer = await prompt.run() as string;
        if (answer && answer.includes(SEP)) {
            const parts = answer.split(SEP);
            if (parts.length > 0)
                return parts[0]?.trim();
        }
        return;
    }
    catch { return }
}

export type OperationNew = 'create' | 'hide' | 'cancel';
export const selectOperationNew = async (filename: string): Promise<OperationNew> => {
    const CREATE = 'Create file from template';
    const HIDE = 'Hide this version';

    const prompt = new Select({
        name: 'select',
        message: `Select operation for ${filename}`,
        choices: [CREATE, HIDE, 'Cancel'],
    });

    try {
        const answer = await prompt.run() as string;
        if (answer)
            switch (answer) {
                case CREATE: {
                    return 'create';
                }
                case HIDE: {
                    return 'hide';
                }
            }
        return 'cancel';
    }
    catch { return 'cancel'; }
}

export type OperationExisting = 'diff' | 'hide' | 'cancel';
export const selectOperationExisting = async (filename: string): Promise<OperationExisting> => {
    const DIFF = 'Open in diff editor';
    const HIDE = 'Hide this version';

    const prompt = new Select({
        name: 'select',
        message: `Select operation for ${filename}`,
        choices: [DIFF, HIDE, 'Cancel'],
    });

    try {
        const answer = await prompt.run() as string;
        if (answer)
            switch (answer) {
                case DIFF: {
                    return 'diff';
                }
                case HIDE: {
                    return 'hide';
                }
            }
        return 'cancel';
    }
    catch { return 'cancel'; }
}
