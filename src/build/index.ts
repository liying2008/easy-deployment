import * as util from 'util';
const exec = util.promisify(require('child_process').exec);

export async function build(cmd: string, path: string) {
    return exec(cmd, {
        cwd: path
    });
}
