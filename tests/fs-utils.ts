
import path, { dirname, resolve } from "path";
import fs, { mkdirSync, realpathSync, rmSync, readdirSync } from "fs";
import { tmpdir } from "os";
import { cp } from "fs/promises";
const tempdir = realpathSync(tmpdir()) + "/";

function createTree(basedir: string, filecontentByPath: { [index: string]: string }) {
    const paths = Object.keys(filecontentByPath)
    for (const end of paths) {
        const abs = path.join(basedir, end);
        try {
            const dir = dirname(abs);
            if (dir.length > 0 && dir !== "/") fs.mkdirSync(dir, { recursive: true });
        } catch (e) { }
        fs.writeFileSync(abs, filecontentByPath[end]);
    }
}

function cpNodeModules(dir: string) {
    fs.cpSync(path.join(process.cwd(), "node_modules", "valibot"), path.join(dir, "../valibot"), { recursive: true })
}

let count = 0
export function prepareFS(dirSuffix: string, filecontentByPath: { [index: string]: string }) {
    const dir = tempdir + `routing-test-${count++}-${dirSuffix}`;
    rmSync(dir, {
        recursive: true,
        force: true,
    });

    createTree(dir, filecontentByPath);
    if (Object.keys(filecontentByPath).length === 0) mkdirSync(dir, { recursive: true });
    cpNodeModules(dir);
    console.log(readdirSync(dir))
    return dir;
}