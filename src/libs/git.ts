import { join, sep } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

export const checkGitBranch = (folder: string): string => {
    const GIT_HEAD_FILE = '.git/HEAD';

    const gitHeadFile = join(folder, sep, GIT_HEAD_FILE);
    if (existsSync(gitHeadFile)) {
        const fileData = readFileSync(gitHeadFile).toString();
        if (fileData) {
            const regex = /^ref: refs\/heads\/(.*)[\n\r]+/.exec(fileData);
            if (regex && regex.length > 1)
                return regex[1] || '';
        }
    }
    return '';
}
