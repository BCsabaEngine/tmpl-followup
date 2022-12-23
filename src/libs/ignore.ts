export const ignore = (masks: string[], files: string[]) => {
    return files.filter(f => {
        for (const mask of masks)
            if (f.includes(mask))
                return false;
        return true;
    });
};
