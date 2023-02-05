import pathUtils from "path/posix";
import { readdir, stat } from "fs/promises";

async function isDirectory(path: string) {  
    return (await stat(path)).isDirectory();
}

export async function importAll(dir: string) {
    const arr = [];

    for (const file of await readdir(dir)) {
        const path = pathUtils.join(dir, file);

        await isDirectory(path) 
            ? arr.push(...await importAll(path))
            : arr.push(
                await import(path)
                    .then(v => v?.default || v)
            );
    }

    return arr;
}