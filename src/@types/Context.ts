import { Config } from './Config'

export type Context = {
    config: Config,
    workingFolder: string,
    templateFolder: string,
    diffTool: string,
    git: {
        working: string,
        template: string,
    },
    addHiddenFile: (filename: string) => void,
    commandLine: {
        folder: string,
        hidden: boolean,
    },
    getWorkingFilename: (filename: string) => string,
}
