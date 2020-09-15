import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getProjectPath, outputMsg } from './util';
import { build } from './build';
import { Uri } from 'vscode';

const displayName = require('../package.json').displayName;

export async function start(deployOnly: boolean) {
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
        canPickMany: false,
        placeHolder: 'Please select a configuration'
    });
    console.log('selectedProfile', selectedProfile);
    if (selectedProfile === undefined) {
        // 没有选择任何 profile
        return;
    }
    const selectedConfig = configurations.filter((value: Configuration) => {
        return value.name === selectedProfile;
    })[0];
    // 应用构建路径
    const buildPath = getBuildPath(selectedConfig.local?.projectPath);
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
        const buildPromise = build(buildCmd, buildPath);
        let buildResult = false;
        buildPromise.then(({stdout, stderr}) => {
            buildResult = true;
            outputMsg('output:\n' + (stdout + stderr || '(Empty)'));
            outputMsg('\nBuild successfully!');
        }).catch(err => {
            buildResult = false;
            console.log(err);
            outputMsg(err.message);
            outputMsg('Build failed, cancel deployment.');
        });
        vscode.window.withProgress(
            {
              title: `${displayName}: Building...`,
              location: vscode.ProgressLocation.Window
            },
            () => buildPromise
        );

        if (!buildResult) {
            // 构建失败，取消部署
            return;
        }
    }
    // 打包

}

function getBuildPath(configProjectPath: string|undefined): string|undefined {
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
