import { isAbsolute, join } from 'node:path';
import { EOL } from 'node:os';
import { existsSync, lstatSync, readFileSync, writeFileSync } from 'node:fs';

import { validateObject } from './ajv';

import { Config, TemplateConfig } from '../@types/Config';
import { Context } from '../@types/Context';
import { commonFolderPrefix } from './commonSubstring';
import { commandLine } from './commandLine';
import { getTemplateFileHash } from './files';
import { checkGitBranch } from './git';
import { getRcFileName, userRcCheckOrCreate } from './rc';
import { getSeparatorVariations } from './separatorVariations';

const CONFIG_NAME = 'tmpl-followup';
const CONFIG_FILE = `${CONFIG_NAME}.json`;

const getWorkingFolder = async (): Promise<string> => {
    const cmdLine = await commandLine();

    let projectDirectory = cmdLine.folder;
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

    throw new Error(`Project folder ${projectDirectory} does not contain configuration (${CONFIG_FILE})`);
}

const updateConfig = (projectDirectory: string, config: Config): void => {
    const configFile = join(projectDirectory, CONFIG_FILE);
    if (existsSync(configFile)) {
        try {
            const fileData = readFileSync(configFile).toString();
            if (!fileData)
                throw new Error('Empty file');
            const fileDataObject = validateObject<Config>(Config, JSON.parse(fileData));
            fileDataObject.hiddenFiles = config.hiddenFiles;
            writeFileSync(configFile, JSON.stringify(fileDataObject, undefined, 2));
        } catch (error) {
            throw new Error(`Cannot update config in file ${configFile}: ${error instanceof Error ? error.message : 'unknown'}`);
        }
    }
}


export const getContext = async (): Promise<Context> => {

    const diffTool = await userRcCheckOrCreate();
    if (!diffTool)
        throw new Error(`Diff tool not configured in ${getRcFileName()}`);

    const workingFolder = await getWorkingFolder();
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

    if (templateconfig) {
        config.templateId ||= templateconfig.templateId;
        if (templateconfig.exclude && templateconfig.exclude.length > 0)
            config.exclude.push(...templateconfig.exclude);
    }

    if (config.templateId === undefined) {
        const tmplPackageJson = join(templateFolder, 'package.json');
        if (existsSync(tmplPackageJson)) {
            try {
                const fileData = readFileSync(tmplPackageJson).toString();
                const fileObject = JSON.parse(fileData);
                const name = fileObject.name;
                if (name)
                    config.templateId = name;
            } catch (error) { console.log(`Cannot parse file ${tmplPackageJson} for name: ${error instanceof Error ? error.message : 'unknown'}`) }
        }
    }
    if (config.repoId === undefined) {
        const workPackageJson = join(workingFolder, 'package.json');
        if (existsSync(workPackageJson)) {
            try {
                const fileData = readFileSync(workPackageJson).toString();
                const fileObject = JSON.parse(fileData);
                const name = fileObject.name;
                if (name)
                    config.repoId = name;
            } catch (error) { console.log(`Cannot parse file ${workPackageJson} for name: ${error instanceof Error ? error.message : 'unknown'}`) }
        }
    }

    const gitignoreFile = join(templateFolder, '.gitignore');
    if (existsSync(gitignoreFile)) {
        try {
            const fileData = readFileSync(gitignoreFile);
            const fileDataLines = fileData.toString().split(EOL).map(l => l.trim()).filter(Boolean).filter(l => !l.startsWith('#'));
            if (fileDataLines.length > 0)
                config.exclude.push(...fileDataLines);
        } catch (error) {
            throw new Error(`Cannot parse ignores from file ${gitignoreFile}: ${error instanceof Error ? error.message : 'unknown'}`);
        }
    }

    config.exclude.push(CONFIG_FILE);


    return {
        config, workingFolder, templateFolder,
        diffTool,
        git: {
            working: checkGitBranch(workingFolder),
            template: checkGitBranch(templateFolder),
        },
        addHiddenFile: (filename: string): void => {
            config.hiddenFiles = config.hiddenFiles.filter(f => f.filename !== filename);
            config.hiddenFiles.push({ filename: filename, hash: getTemplateFileHash(templateFolder, filename) });
            updateConfig(workingFolder, config);
        },
        commandLine: await commandLine(),
        getWorkingFilename: (filename: string): string => {
            if (config.templateId && config.repoId)
                for (const [templateId, repoId] of getSeparatorVariations(config.templateId, config.repoId, [...'-_.']))
                    while (filename.includes(templateId))
                        filename = filename.replace(templateId, repoId);
            return filename;
        },
        getWorkingContent: (content: string): string => {
            if (config.templateId && config.repoId)
                for (const [templateId, repoId] of getSeparatorVariations(config.templateId, config.repoId, [...'-_.']))
                    while (content.includes(templateId))
                        content = content.replace(templateId, repoId);
            return content;
        },
    }
}

export const getContextDisplay = (context: Context): string => {
    const folderPrefix = commonFolderPrefix([context.templateFolder, context.workingFolder]);

    let templateFolder = context.templateFolder.replace(folderPrefix, '');
    if (context.git.template)
        templateFolder += ` (${context.git.template})`;

    let workingFolder = context.workingFolder.replace(folderPrefix, '');
    if (context.git.working)
        workingFolder += ` (${context.git.working})`;

    return `Compare in common folder ${folderPrefix}\n${templateFolder} -> ${workingFolder}`;
}