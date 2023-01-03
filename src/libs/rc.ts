import { join, sep } from 'node:path';
import { EOL, homedir } from 'node:os';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { selectCreateRcFile } from './prompts';

const RC_NAME = '.tmpl-followuprc';

const RC_DEFAULT_CONTENT = `
#Linux
#Windows
#difftool=code -d -n $1 $2

#MacOS
#difftool=/Applications/Visual\\ Studio\\ Code.app/Contents/Resources/app/bin/code -d -n $1 $2

`;

export const getRcFileName = () => join(homedir(), sep, RC_NAME);

export const userRcCheckOrCreate = async (): Promise<string> => {
    const rcFile = getRcFileName();
    if (existsSync(rcFile)) {
        const lines = readFileSync(rcFile).toString().split(EOL);
        for (const line of lines) {
            const regex = /^difftool=(.*)$/.exec(line);
            if (regex && regex.length > 1)
                return regex[1] || '';
        }
        return '';
    }
    else {
        console.log(`Cannot find your ${RC_NAME} in home folder. This is necessary for diff.`)
        if (await selectCreateRcFile(rcFile)) {
            writeFileSync(rcFile, RC_DEFAULT_CONTENT);
            console.log(`Edit your ${rcFile} file and run tmpl-followup again.`)
        }
        return '';
    }
}
