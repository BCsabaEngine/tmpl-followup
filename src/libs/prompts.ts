import { FileDiffItem } from './FileDiff';

// eslint-disable-next-line @typescript-eslint/no-var-requires, unicorn/prefer-module
const { Select } = require('enquirer');

const SEP = '…';

let promptFileSelect: typeof Select;
let promptOperationNew: typeof Select;
let promptOperationExisting: typeof Select;

export const cancel = (): void => {
    if (promptFileSelect)
        promptFileSelect.cancel();
    if (promptOperationNew)
        promptOperationNew.cancel();
    if (promptOperationExisting)
        promptOperationExisting.cancel();
}

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

    promptFileSelect = new Select({
        name: 'file',
        message: 'Select a file to process',
        choices: diffStateToDisplay,
    });

    try {
        const answer = await promptFileSelect.run() as string;
        if (answer && answer.includes(SEP)) {
            const parts = answer.split(SEP);
            if (parts.length > 0)
                return parts[0]?.trim();
        }
        return;
    }
    catch { return }
    finally { promptFileSelect = undefined; }
}

export type OperationNew = 'create' | 'hide' | 'cancel';
export const selectOperationNew = async (filename: string): Promise<OperationNew> => {
    const CREATE = 'Create file from template';
    const HIDE = 'Hide this version';

    promptOperationNew = new Select({
        name: 'select',
        message: `Select operation for ${filename}`,
        choices: [CREATE, HIDE, 'Cancel'],
    });

    try {
        const answer = await promptOperationNew.run() as string;
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
    finally { promptOperationNew = undefined; }
}

export type OperationExisting = 'diff' | 'hide' | 'cancel';
export const selectOperationExisting = async (filename: string): Promise<OperationExisting> => {
    const DIFF = 'Open in diff editor';
    const HIDE = 'Hide this version';

    promptOperationExisting = new Select({
        name: 'select',
        message: `Select operation for ${filename}`,
        choices: [DIFF, HIDE, 'Cancel'],
    });

    try {
        const answer = await promptOperationExisting.run() as string;
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
    finally { promptOperationExisting = undefined; }
}
