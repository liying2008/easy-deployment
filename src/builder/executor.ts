import * as util from 'util';
// import { exec } from 'child_process';
const exec = util.promisify(require('child_process').exec);

export async function execute(cmd: string, path: string) {
    return exec(cmd, {
        cwd: path,
        // encoding: 'utf8'
    });
}
