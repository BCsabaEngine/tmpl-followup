import { isAbsolute, join } from 'node:path';
import { EOL } from 'node:os';
import { existsSync, lstatSync, readFileSync } from 'node:fs';

import { validateObject } from './ajv';

import { Config, TemplateConfig } from '../@types/Config';
import { Context } from '../@types/Context';

const CONFIG_NAME = 'tmpl-followup';
const CONFIG_FILE = `${CONFIG_NAME}.json`;

const getWorkingFolder = (): string => {
    const argument = process.argv.slice(2);
    let projectDirectory = (argument.length > 0 ? argument[0] : '.') || '';
    if (!isAbsolute(projectDirectory))
        projectDirectory = join(process.cwd(), projectDirectory);

    if (!existsSync(projectDirectory))
        throw new Error(`Project folder ${projectDirectory} not exists`);

    if (!lstatSync(projectDirectory).isDirectory())
        throw new Error(`Project folder ${projectDirectory} is not a folder`);

    return projectDirectory;
}

const getConfig = (projectDirectory: string): Config => {
    const configFile = join(projectDirectory, CONFIG_FILE);
    if (existsSync(configFile)) {
        try {
            const fileData = readFileSync(configFile).toString();
            if (!fileData)
                throw new Error('Empty file');
            const fileDataObject = JSON.parse(fileData);
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

export const getContext = (): Context => {
    const workingFolder = getWorkingFolder();
    const config: Config = getConfig(workingFolder);
    const templateFolder = join(workingFolder, config.templateFolder);

    if (!lstatSync(templateFolder).isDirectory())
        throw new Error(`Template folder ${templateFolder} is not a folder`);

    let templateconfig: TemplateConfig | undefined;
    const configFile = join(templateFolder, CONFIG_FILE);
    if (existsSync(configFile)) {
        try {
            const fileData = readFileSync(configFile).toString();
            if (!fileData)
                throw new Error('Empty file');
            const fileDataObject = JSON.parse(fileData);
            templateconfig = validateObject<TemplateConfig>(TemplateConfig, fileDataObject);
        } catch (error) {
            throw new Error(`Cannot parse config from file ${configFile}: ${error instanceof Error ? error.message : 'unknown'}`);
        }
    }

    if (!templateconfig) {
        const packageFile = join(templateFolder, 'package.json');
        if (existsSync(packageFile)) {
            try {
                const fileData = readFileSync(packageFile);
                const fileDataObject = JSON.parse(fileData.toString());
                if (fileDataObject[CONFIG_NAME])
                    templateconfig = validateObject<TemplateConfig>(TemplateConfig, fileDataObject[CONFIG_NAME]);
            } catch (error) {
                throw new Error(`Cannot parse config from file ${packageFile}: ${error instanceof Error ? error.message : 'unknown'}`);
            }
        }
    }
    if (templateconfig) {
        config.templateId ||= templateconfig.templateId;
        if (templateconfig.exclude && templateconfig.exclude.length > 0) {
            config.exclude = config.exclude || [];
            config.exclude.push(...templateconfig.exclude);
        }
    }

    const gitignoreFile = join(templateFolder, '.gitignore');
    if (existsSync(gitignoreFile)) {
        try {
            const fileData = readFileSync(gitignoreFile);
            const fileDataLines = fileData.toString().split(EOL).map(l => l.trim()).filter(Boolean).filter(l => !l.startsWith('#'));
            if (fileDataLines.length > 0) {
                config.exclude = config.exclude || [];
                config.exclude.push(...fileDataLines);
            }
        } catch (error) {
            throw new Error(`Cannot parse ignores from file ${gitignoreFile}: ${error instanceof Error ? error.message : 'unknown'}`);
        }
    }

    config.exclude = config.exclude || [];
    config.exclude.push(CONFIG_FILE);


    return { config, workingFolder, templateFolder }
}