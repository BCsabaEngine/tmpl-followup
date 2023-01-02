import { Config } from './Config'

export type Context = {
    config: Config,
    workingFolder: string,
    templateFolder: string,
    addHiddenFile: (filename: string) => void,
    commandLine: {
        folder: string,
        hidden: boolean,
    },
}
