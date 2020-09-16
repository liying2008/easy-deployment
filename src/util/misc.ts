import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Uri } from 'vscode';


/**
 * 获取当前项目的绝对路径
 */
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

/**
 * 在编辑器中打开工作区的 settings.json 文件
 */
export async function openSettings() {
    const projectPath = getProjectPath();
    if (projectPath === undefined) {
        vscode.window.showErrorMessage('No open workspace!');
        return;
    }
    const settingsPath = path.join(projectPath, './.vscode/settings.json');
    let uri = Uri.file(settingsPath);
    const exist = fs.existsSync(settingsPath);
    if (!exist) {
        fs.writeFileSync(settingsPath, '{}');
    }
    let success = await vscode.commands.executeCommand('vscode.open', uri);
}
