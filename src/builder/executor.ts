import * as util from 'node:util'
import { exec } from 'node:child_process'

const execPromise = util.promisify(exec)

export async function execute(cmd: string, path: string) {
  return execPromise(cmd, {
    cwd: path,
    // encoding: 'utf8'
  })
}
