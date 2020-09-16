import * as vscode from 'vscode';
import * as path from 'path';
import { openSettings, outputMsg, compress, getActivatedConfig, getBuildPath, getOutputPath } from './util';
import { build } from './builder';
import { deploy } from './ssh';


export async function start(deployOnly: boolean) {
    // 获取使用的配置
    const selectedConfig = await getActivatedConfig();
    if (selectedConfig === undefined) {
        return;
    }

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
        const buildResult = await build(selectedConfig, buildPath);
        if (!buildResult) {
            // 构建失败，取消部署
            return;
        }
    }
    // 打包压缩
    outputMsg('\nStart packing and compress...');
    const configOutputDir = selectedConfig.local?.outputDir;
    if (!configOutputDir) {
        // 输出目录为空
        vscode.window.showErrorMessage('The output directory cannot be set to empty.');
        openSettings();
        return;
    }

    const realOutputPath = getOutputPath(configOutputDir);
    const currentTime = new Date().getTime();
    const outputFilepath = `${realOutputPath}-${currentTime}.tar.gz`;
    try {
        await compress(realOutputPath!, outputFilepath);
    } catch(err) {
        console.log(err);
        outputMsg('\n' + err.message);
        outputMsg('\nFile compression failed, cancel deployment.');
        return;
    }
    const outputFilename = path.parse(outputFilepath).base;
    outputMsg('\nPackaging and compression completed.\nThe output file name is ' + outputFilepath);

    // 执行部署：建立 SSH 连接，上传文件，执行后续命令
    outputMsg('\nStart deployment...');
    try {
        await deploy(selectedConfig, outputFilepath);
    } catch(err) {
        console.log(err);
        outputMsg('\n' + err.message);
        outputMsg('\nDeployment failed.');
        return;
    }
}

