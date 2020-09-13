import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getProjectPath, outputMsg } from './util';
import { build } from './build';
import { Uri } from 'vscode';

export async function start(selectedPath: string|undefined, deployOnly: boolean) {
    // 获取配置
    const workspaceConfiguration = vscode.workspace.getConfiguration('easyDeployment');

    const config: Config = workspaceConfiguration.config;
    console.log('config', config);

    const configurations = config.configurations;
    console.log('configurations', configurations);
    if (!configurations) {
        // 缺少 configurations 配置
        vscode.window.showErrorMessage('Missing configurations.');
        openSettings();
        return;
    }
    // 获取配置名称列表
    const profileNames = configurations.map((value: Configuration) => {
        return value.name;
    }).filter((value: string) => {
        return !!value;
    });
    // 显示选择
    const selectedProfile = await vscode.window.showQuickPick(profileNames, {
        canPickMany: false
    });
    console.log('selectedProfile', selectedProfile);
    const selectedConfig = configurations.filter((value: Configuration) => {
        return value.name === selectedProfile;
    })[0];
    // 应用构建路径
    const buildPath = getBuildPath(selectedPath, selectedConfig.local?.projectPath);
    console.log('buildPath', buildPath);
    if (!buildPath) {
        // 构建路径为空
        vscode.window.showErrorMessage('Build path is empty.');
        return;
    }
    if (!deployOnly) {
        // 构建应用
        const buildCmd = selectedConfig.local.buildCmd || 'yarn build';
        outputMsg('Building, please wait a moment...\n');
        try {
            const { stdout, stderr } = await build(buildCmd, buildPath);
            outputMsg('stdout:\n' + (stdout || '(Empty)'));
            outputMsg('\nstderr:\n' + (stderr || '(Empty)'));
        } catch(err) {
            console.log(err);
            outputMsg(err.message);
            outputMsg('Build failed, cancel deployment.');
            return;
        }
    }
    // 打包

}

function getBuildPath(selectedPath: string|undefined, configProjectPath: string|undefined): string|undefined {
    if (selectedPath) {
        return selectedPath;
    }
    const projectPath = getProjectPath();
    if (projectPath === undefined) {
        vscode.window.showErrorMessage('No open workspace!');
        return undefined;
    }
    if (configProjectPath === undefined) {
        configProjectPath = '.';
    }
    return path.join(projectPath, configProjectPath);
}

async function openSettings() {
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
