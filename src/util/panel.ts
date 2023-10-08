import * as vscode from 'vscode'
import { displayName } from '../../package.json'

const outputChannel = vscode.window.createOutputChannel(displayName)

/**
 * 清空 Output Panel 中的信息
 */
export function clearOutput() {
  outputChannel.clear()
}

/**
 * 在 Output Panel 中输出信息
 * @param msg 输出的信息
 */
export function outputMsg(msg: string) {
  outputChannel.appendLine(msg)
  outputChannel.show()
}
