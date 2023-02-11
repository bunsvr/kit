import pathUtils from "path/posix";
import { readdir, stat } from "fs/promises";
import { Route } from "./route";

async function isDirectory(path: string) {
    return (await stat(path)).isDirectory();
}

export async function importAll(dir: string) {
    const arr = [];

    for (const file of await readdir(dir)) {
        const path = pathUtils.join(dir, file);

        if (await isDirectory(path))
            arr.push(...await importAll(path))
        else {
            const route = await import(path)
                .then(v => v?.default || v);

            if (route instanceof Route)
                arr.push(route);
        }
    }

    return arr;
}