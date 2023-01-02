export const isFileIgnored = (masks: string[], filename: string) => {
    for (const mask of masks)
        if (filename.includes(mask))
            return true;
    return false;
};

export const ignoreFiles = (masks: string[], files: string[]) => {
    return files.filter(f => !isFileIgnored(masks, f));
};
