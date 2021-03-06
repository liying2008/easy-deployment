import * as vscode from 'vscode';
const displayName = require('../../package.json').displayName;

const outputChannel = vscode.window.createOutputChannel(displayName);

/**
 * 在 Output Panel 中输出信息
 * @param msg 输出的信息
 */
export function outputMsg(msg: string) {
    outputChannel.appendLine(msg);
    outputChannel.show();
}
