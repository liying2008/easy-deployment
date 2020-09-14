import * as vscode from 'vscode';

const displayName = require('../../package.json').displayName;

export function getProjectPath(): string|undefined {
    const workspaceName = vscode.workspace.name;
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return undefined;
    }
    let fsPath = undefined;
    workspaceFolders!.forEach((folder: vscode.WorkspaceFolder) => {
        if (folder.name === workspaceName) {
            fsPath = folder.uri.fsPath;
            return;
        }
    });
    return fsPath;
}

const outputChannel = vscode.window.createOutputChannel(displayName);
export function outputMsg(msg: string) {
    outputChannel.appendLine(msg);
    outputChannel.show();
}
