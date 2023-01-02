import { getContext, getContextDisplay } from './libs/config';
import { FileDiff } from './libs/FileDiff';
import { copyFromTemplate, getTemplateFiles } from './libs/files';
import { removeAll as removeAllFileWatch, watch as watchFile } from './libs/fileWatch';
import { fileSelectToProcess, selectOperationExisting, selectOperationNew } from './libs/prompts';
import { getReason, reload } from './libs/reloader';
import { runDiffTool } from './libs/spawn';

const start = async () => {
    try {
        console.clear();
        console.log('[TMPL-FOLLOWUP] Follow template repo');
        const context = await getContext();
        console.log(getContextDisplay(context) + '...');

        const files = getTemplateFiles(context);
        console.log(`${files.length} template files found`);

        const fileDiffs = new FileDiff(context, files);
        if (fileDiffs.count() === 0)
            console.log('No diffs found, working folder is identical to template');

        while (fileDiffs.count() > 0) {
            const reloadReason = getReason(true);
            if (reloadReason)
                console.log(`Reloaded because ${reloadReason}`);

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
                                context.addHiddenFile(selectedFile);
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
                                watchFile(context, selectedFile, () => {
                                    fileDiffs.updateFile(selectedFile);
                                    reload(`${selectedFile} changed`);
                                });
                                break;
                            }
                            case 'hide': {
                                context.addHiddenFile(selectedFile);
                                break;
                            }
                        }
                        fileDiffs.updateFile(selectedFile);
                    }
            }
            else if (!getReason())
                break;

            console.clear();
        }
    }
    catch (error) { console.error('Error: ' + (error instanceof Error ? error.message : 'unknown')); }

    removeAllFileWatch();
}

void start();
