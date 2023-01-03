import { execSync } from 'node:child_process';
import { join } from 'node:path';

import { Context } from '../@types/Context';

export const runDiffTool = (context: Context, filename: string) => {
    const templateFile = join(context.templateFolder, filename);
    const workingFile = join(context.workingFolder, context.getWorkingFilename(filename));

    const diffTool = context.diffTool.replace('$1', templateFile).replace('$2', workingFile);
    if (!diffTool)
        throw new Error('Diff tool not configured');
    execSync(diffTool);
}