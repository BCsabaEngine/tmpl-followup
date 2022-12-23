import { getContext, getContextDisplay } from './libs/config';
import { getWorkingFilesDiff } from './libs/fileDiff';
import { getTemplateFiles } from './libs/files';
const { Select } = require('enquirer');

const start = async () => {
    try {
        console.log('[TMPL-FOLLOWUP] Follow template repo');
        const context = getContext();
        console.log(getContextDisplay(context) + '...');

        const files = getTemplateFiles(context);
        console.log(`${files.length} template files found`);

        const diffState = getWorkingFilesDiff(context, files);
        if (diffState.length > 0) {
            console.log(`${diffState.length} diffs found`);

            const diffStateToDisplay = diffState.map(ds => {
                const infos = [];
                if (ds.missing)
                    infos.push('new');
                else {
                    if (ds.added)
                        infos.push(`+${ds.added}`);
                    if (ds.removed)
                        infos.push(`-${ds.removed}`);
                }
                return `${ds.filename} (${infos.join('')})`;
            });

            const prompt = new Select({
                name: 'file',
                message: 'Select a file to process',
                choices: diffStateToDisplay,
            });

            const answer = await prompt.run();
            console.log('Answer:', answer);
        }
        else
            console.log('No diffs found, working folder is identical to template');
    }
    catch (error) { console.error('Error: ' + (error instanceof Error ? error.message : 'unknown')); }
}

void start();
