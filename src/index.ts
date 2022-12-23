import { getContext, getContextDisplay } from './libs/config';
import { FileDiff } from './libs/FileDiff';
import { copyFromTemplate, getTemplateFiles } from './libs/files';
import { fileSelectToProcess, selectOperationExisting, selectOperationNew } from './libs/prompts';
import { runDiffTool } from './libs/spawn';

const start = async () => {
    try {
        console.log('[TMPL-FOLLOWUP] Follow template repo');
        const context = await getContext();
        console.log(getContextDisplay(context) + '...');

        const files = getTemplateFiles(context);
        console.log(`${files.length} template files found`);

        const fileDiffs = new FileDiff(context, files);
        if (fileDiffs.count() === 0)
            console.log('No diffs found, working folder is identical to template');

        while (fileDiffs.count() > 0) {
            console.log(`${fileDiffs.count()} diffs found`);

            const selectedFile = await fileSelectToProcess(fileDiffs.getAll());
            if (selectedFile) {
                const diffState = fileDiffs.getByFilename(selectedFile);
                if (diffState)
                    if (diffState.missing) {
                        const op = await selectOperationNew(selectedFile);
                        switch (op) {
                            case 'create': {
                                try { copyFromTemplate(context, selectedFile); }
                                catch (error) { console.error('Create error: ' + (error instanceof Error ? error.message : 'unknown')); }
                                break;
                            }
                            case 'hide': {
                                break;
                            }
                        }
                        fileDiffs.updateFile(selectedFile);
                    }
                    else {
                        const op = await selectOperationExisting(selectedFile);
                        switch (op) {
                            case 'diff': {
                                runDiffTool(context, selectedFile);
                                break;
                            }
                            case 'hide': {
                                break;
                            }
                        }
                        fileDiffs.updateFile(selectedFile);
                    }
            }
            else
                break;
        }
    }
    catch (error) { console.error('Error: ' + (error instanceof Error ? error.message : 'unknown')); }
}

void start();
