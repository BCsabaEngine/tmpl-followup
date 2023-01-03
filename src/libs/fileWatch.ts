import { watchFile, StatWatcher } from 'node:fs';
import { join, sep } from 'node:path';
import { Context } from '../@types/Context';

const watches: Map<string, StatWatcher> = new Map<string, StatWatcher>();

export type WatchEvent = () => void;
export const watch = (context: Context, file: string, callback: WatchEvent) => {
    const filename = join(context.workingFolder, sep, context.getWorkingFilename(file));
    if (watches.has(filename))
        return;

    const watcher = watchFile(filename, { interval: 100 }, callback);
    watches.set(filename, watcher);
}

export const removeAll = () => {
    for (const watcher of watches.values()) {
        watcher.removeAllListeners();
        watcher.unref();
    }
    watches.clear();
}
