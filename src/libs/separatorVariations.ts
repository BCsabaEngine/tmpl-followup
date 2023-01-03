export const getSeparatorVariations = (templateId: string, repoId: string, separators: string[]): [string, string][] => {
    const variations: [string, string][] = [];
    variations.push([templateId, repoId]);

    for (let index = 0; index < separators.length; index++)
        for (let subindex = 0; subindex < separators.length; subindex++)
            if (index !== subindex) {
                let t = templateId;
                while (t.includes(separators[index] || ''))
                    t = t.replace(separators[index] || '', separators[subindex] || '');

                let r = repoId;
                while (r.includes(separators[index] || ''))
                    r = r.replace(separators[index] || '', separators[subindex] || '');

                const variation: [string, string] = [t, r];
                if (!variations.some(element => element[0] === variation[0] && element[1] === variation[1]))
                    variations.push(variation);
            }

    return variations;
}
