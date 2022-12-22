import { getConfig } from './libs/config';

try {
    const config = getConfig();
    console.log(config);
}
catch (error) { console.error(error instanceof Error ? error.message : error); }
