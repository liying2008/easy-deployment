import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import { NodeSSH } from 'node-ssh';
import { getFormattedCurrentTime, openSettings, outputMsg, trimTrailingSlash } from '../util';


let ssh = new NodeSSH();

export async function deploy(selectedConfig: Configuration, outputFilepath: string): Promise<boolean> {
    const sshConfig = selectedConfig.ssh;
    const remoteConfig = selectedConfig.remote;
    if (!sshConfig || !sshConfig.host || !sshConfig.username) {
        // 未配置host或username
        vscode.window.showErrorMessage('Host or username is not configured.');
        openSettings();
        return Promise.resolve(false);
    }
    if (!remoteConfig || !remoteConfig.deploymentPath) {
        // 未配置远程部署路径
        vscode.window.showErrorMessage('The remote deployment path is not configured.');
        openSettings();
        return Promise.resolve(false);
    }
    // 建立 ssh 连接
    outputMsg('Establish ssh connection.');
    ssh = await ssh.connect({
        host: sshConfig.host,
        username: sshConfig.username,
        port: sshConfig.port || 22,
        password: sshConfig.password || ''
    });
    // 上传文件
    let deploymentPath = remoteConfig.deploymentPath;
    const postCmd = remoteConfig.postCmd;
    const outputFilename = path.parse(outputFilepath).base;
    deploymentPath = getValidRemotePath(deploymentPath);
    // 去掉路径末尾的 /
    deploymentPath = trimTrailingSlash(deploymentPath);

    const finalDeploymentPath = deploymentPath + '/' + outputFilename;
    console.log('finalDeploymentPath', finalDeploymentPath);
    outputMsg(`Upload ${outputFilepath} to ${remoteConfig.deploymentPath}`);
    // 开始上传文件
    try {
        await ssh.putFile(outputFilepath, finalDeploymentPath);
        outputMsg('\nUpload successfully');
    } catch (error) {
        console.log(error);
        outputMsg('\nUpload failed:\n' + error.message);
        return Promise.resolve(false);
    }

    // 备份原有文件
    const backupOriginalFiles = !!remoteConfig.backupOriginalFiles;
    if (backupOriginalFiles) {
        outputMsg('\nStart to backup original files');
        const success = await backupFiles(ssh, remoteConfig);
        if (success) {
            outputMsg('\nBackup successfully');
        } else {
            outputMsg('\nBackup failed, cancel deployment.');
            return Promise.resolve(false);
        }
    }

    // 删除原有文件
    const deleteOriginalFiles = !!remoteConfig.deleteOriginalFiles;
    if (deleteOriginalFiles) {
        outputMsg('\nStart to delete original files');
        const success = await deleteFiles(ssh, remoteConfig);
        if (success) {
            outputMsg('\nDelete successfully');
        } else {
            outputMsg('\nDelete failed, cancel deployment.');
            return Promise.resolve(false);
        }
    }
    return true;
}


async function backupFiles(ssh: NodeSSH, remoteConfig: RemoteConfiguration): Promise<boolean> {
    let deploymentPath = remoteConfig.deploymentPath;
    let backupTo = remoteConfig.backupTo;
    if (!backupTo) {
        // 缺少 backupTo 配置
        vscode.window.showErrorMessage('Property backupTo is not configured.');
        openSettings();
        return Promise.resolve(false);
    }
    deploymentPath = getValidRemotePath(deploymentPath);
    backupTo = getValidRemotePath(backupTo);
    const basename = path.posix.basename(deploymentPath);

    const backupName = `${basename}-${getFormattedCurrentTime()}`;
    const finalBackupPath = `${trimTrailingSlash(backupTo)}/${backupName}`;
    const result = await ssh.execCommand(`cp -r "${deploymentPath}" "${finalBackupPath}"`);
    console.log('backupFiles::CODE: ' + result.code);
    console.log('backupFiles::STDOUT: ' + result.stdout);
    console.log('backupFiles::STDERR: ' + result.stderr);

    if (result.code !== null && result.code !== 0) {
        // 备份文件失败
        return Promise.resolve(false);
    }

    return Promise.resolve(true);
}

async function deleteFiles(ssh: NodeSSH, remoteConfig: RemoteConfiguration): Promise<boolean> {
    let deploymentPath = remoteConfig.deploymentPath;
    deploymentPath = getValidRemotePath(deploymentPath);
    const dirname = path.posix.dirname(deploymentPath);
    const basename = path.posix.basename(deploymentPath);

    const command = `test -f ${basename} && rm -f ${basename}; test -d ${basename} && rm -fr ${basename} && mkdir ${basename}`;
    console.log('deleteFiles::command', command);

    const result = await ssh.execCommand(command, { cwd: dirname });
    console.log('deleteFiles::CODE: ' + result.code);
    console.log('deleteFiles::STDOUT: ' + result.stdout);
    console.log('deleteFiles::STDERR: ' + result.stderr);

    if (result.code !== null && result.code !== 0) {
        // 删除文件失败
        return Promise.resolve(false);
    }

    return Promise.resolve(true);
}


function getValidRemotePath(remotePath: string) {
    if (remotePath.startsWith('~/')) {
        remotePath = './' + remotePath.substring(2);
    }
    return remotePath;
}