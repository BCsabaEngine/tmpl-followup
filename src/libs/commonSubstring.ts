import { sep } from 'node:path';

export const commonSubstring = (items: string[]) => {
    if (items.length === 0) return '';

    items.sort();
    const a1 = items[0] || '';
    const a2 = items[items.length - 1] || '';
    const length = a1.length;

    let index = 0;
    while (index < length && a1.charAt(index) === a2.charAt(index))
        index++;

    return a1.slice(0, index);
}
export const commonFolderPrefix = (items: string[]) => {
    const commonSubstr = commonSubstring(items);
    const m = commonSubstr.match(`.*${sep}`);
    return m? m[0]: '';
}
