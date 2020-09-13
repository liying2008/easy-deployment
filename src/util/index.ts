import * as vscode from 'vscode';

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

const outputChannel = vscode.window.createOutputChannel("Easy Deployment");
export function outputMsg(msg: string) {
    outputChannel.appendLine(msg);
    outputChannel.show();
}
