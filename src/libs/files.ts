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
