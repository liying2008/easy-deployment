import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

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


export function compress(sourcePath: string, outputPath: string) {
    let output = fs.createWriteStream(outputPath);
    let archive = archiver('tar', {
        gzip: true,
        gzipOptions: {
            level: 5
        }
    });
    archive.pipe(output);
    archive.directory(sourcePath, path.basename(sourcePath));
    return archive.finalize();
}
