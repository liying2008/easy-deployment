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
    if (!configurations || configurations.length === 0) {
        // 缺少 configurations 配置
        vscode.window.showErrorMessage('Missing configurations.');
        openSettings();
        return;
    }
    // 获取配置名称列表
    const profileNames = configurations.map((value: Configuration) => {
        return value.name;
    }).filter((value: string|undefined) => {
        return !!value;
    });

    // console.log('profileNames', profileNames);
    if (!profileNames || profileNames.length === 0) {
        // 配置不完整
        vscode.window.showErrorMessage('Incomplete configuration.');
        openSettings();
        return;
    }

    let selectedProfile: string|undefined = undefined;
    if (profileNames.length > 1) {
        // 可选项大于1，显示选择
        selectedProfile = await vscode.window.showQuickPick(profileNames, {
            canPickMany: false,
            placeHolder: 'Please select a configuration'
        });
        console.log('selectedProfile', selectedProfile);
        if (selectedProfile === undefined) {
            // 没有选择任何 profile
            return;
        }
    } else {
        // 可选项只有一个，默认选择即可
        selectedProfile = profileNames[0];
    }

    // 选中的配置
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
        const buildCmd = selectedConfig.local.buildCmd;
        if (!buildCmd) {
            // 构建命令为空
            vscode.window.showErrorMessage('The build command cannot be empty.');
            openSettings();
            return;
        }
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
