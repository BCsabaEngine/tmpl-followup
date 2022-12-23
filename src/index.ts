import { sync as globsync } from 'glob';

import { commonFolderPrefix } from './libs/commonSubstring';
import { getContext } from './libs/config';
import { ignore } from './libs/ignore';

try {
    const context = getContext();
    {
        const folderPrefix = commonFolderPrefix([context.templateFolder, context.workingFolder]);
        console.log(`Compare ${context.templateFolder.replace(folderPrefix, `[${folderPrefix}]`)} -> ${context.workingFolder.replace(folderPrefix, '')}`);
    }

    const files = globsync('**', {
        cwd: context.templateFolder,
        nodir: true,
        nosort: true
    });
    const files2 = ignore(context.config.exclude || [], files)
    files2.sort();
    console.log(files2);
    console.log(files2.length);


}
catch (error) { console.error(error instanceof Error ? error.message : error); }
