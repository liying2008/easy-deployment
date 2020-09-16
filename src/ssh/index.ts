import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import { NodeSSH } from 'node-ssh';
import { openSettings, outputMsg } from '../util';


const ssh = new NodeSSH();

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
    await ssh.connect({
        host: sshConfig.host,
        username: sshConfig.username,
        port: sshConfig.port || 22,
        password: sshConfig.password || ''
    });
    // 上传文件
    let deploymentPath = remoteConfig.deploymentPath;
    const postCmd = remoteConfig.postCmd;
    const outputFilename = path.parse(outputFilepath).base;
    // 注：putFile 方法不识别 ~，需要转成 ./
    if (deploymentPath.startsWith('~/')) {
        deploymentPath = './'+deploymentPath.substring(2);
    }
    // 去掉路径末尾的 /
    if (deploymentPath.endsWith('/')) {
        deploymentPath = deploymentPath.substring(0, deploymentPath.length - 1);
    }
    const finalDeploymentPath = deploymentPath + '/' + outputFilename;
    console.log('finalDeploymentPath', finalDeploymentPath);
    outputMsg(`Upload ${outputFilepath} to ${remoteConfig.deploymentPath}`);
    ssh.putFile(outputFilepath, finalDeploymentPath).then(function() {
        console.log("The File thing is done");
    }, function(error) {
        console.log("Something's wrong");
        console.log(error);
    });
    return true;
}
