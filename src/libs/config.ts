import { isAbsolute, join } from 'node:path';
import { existsSync, lstatSync, readFileSync } from 'node:fs';

import { validateObject } from './ajv';

import { Config } from '../@types/Config';

const CONFIG_NAME = 'tmpl-followup';
const CONFIG_FILE = `${CONFIG_NAME}.json`;

export const getConfig = (): Config => {
    const argument = process.argv.slice(2);
    let projectDirectory = (argument.length > 0 ? argument[0] : '.') || '';
    if (!isAbsolute(projectDirectory))
        projectDirectory = join(process.cwd(), projectDirectory);

    if (!existsSync(projectDirectory))
        throw new Error(`Project folder ${projectDirectory} not exists`);

    if (!lstatSync(projectDirectory).isDirectory())
        throw new Error(`Project folder ${projectDirectory} is not a folder`);

    const configFile = join(projectDirectory, CONFIG_FILE);
    if (existsSync(configFile)) {
        try {
            const fileData = readFileSync(configFile);
            const fileDataObject = JSON.parse(fileData.toString());
            return validateObject<Config>(Config, fileDataObject);
        } catch (error) {
            throw new Error(`Cannot parse config from file ${configFile}: ${error instanceof Error ? error.message : 'unknown'}`);
        }
    }

    const packageFile = join(projectDirectory, 'package.json');
    if (existsSync(packageFile)) {
        try {
            const fileData = readFileSync(packageFile);
            const fileDataObject = JSON.parse(fileData.toString());
            if (fileDataObject[CONFIG_NAME])
                return validateObject<Config>(Config, fileDataObject[CONFIG_NAME]);
        } catch (error) {
            throw new Error(`Cannot parse config from file ${packageFile}: ${error instanceof Error ? error.message : 'unknown'}`);
        }
    }

    throw new Error(`Project folder ${projectDirectory} does not contain configuration (${CONFIG_FILE} or package.json/${CONFIG_NAME})`);
}
