import { execSync } from 'node:child_process';
import { join } from 'node:path';

import { Context } from '../@types/Context';

export const runDiffTool = (context: Context, filename: string) => {
    const templateFile = join(context.templateFolder, filename);
    const workingFile = join(context.workingFolder, filename);

    execSync(`code -d -n ${templateFile} ${workingFile}`);
}