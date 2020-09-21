import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { openSettings, outputMsg, compress, getActivatedConfig, getBuildPath, getOutputPath, removeIfExist } from './util';
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
    if (realOutputPath === undefined) {
        // 输出目录解析失败
        return;
    }
    const fileStat = fs.statSync(realOutputPath);
    let outputIsFile = false;

    if (fileStat.isDirectory()) {
        outputIsFile = false;
    } else if (fileStat.isFile()) {
        outputIsFile = true;
    } else {
        // 其他类型的文件，不支持
        outputMsg('File of this type is not supported!');
        return;
    }

    const currentTime = new Date().getTime();
    const outputFilepath = `${realOutputPath}-${currentTime}.tar.gz`;
    try {
        await compress(realOutputPath, outputFilepath, outputIsFile);
    } catch(err) {
        console.log(err);
        outputMsg('\nERROR: ' + err.message);
        outputMsg('\nFile compression failed, cancel deployment.');
        return;
    }
    // const outputFilename = path.parse(outputFilepath).base;
    outputMsg('\nPackaging and compression completed.\nThe output file name is ' + outputFilepath);

    // 执行部署：建立 SSH 连接，上传文件，执行后续命令
    outputMsg('\nStart deployment...');
    try {
        await deploy(selectedConfig, outputFilepath);
        // 删除本地打包的 tar.gz
        removeIfExist(outputFilepath);
        outputMsg('\nSuccessful deployment!');
        outputMsg('\nAll done!');
    } catch(err) {
        console.log(err);
        // 删除本地打包的 tar.gz
        removeIfExist(outputFilepath);
        outputMsg('\nERROR: ' + err.message);
        outputMsg('\nDeployment failed!');
        return;
    }
}

