import { cancel as cancelPrompts } from './prompts';

let reasonString = '';

export const getReason = (clear = false) => {
    try { return reasonString; }
    finally { if (clear) reasonString = ''; }
}

export const reload = (reason: string) => {
    reasonString = reason;
    cancelPrompts();
}
