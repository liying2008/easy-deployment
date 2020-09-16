import * as vscode from 'vscode';
import * as path from 'path';
import { openSettings, outputMsg, compress, getActivatedConfig, getBuildPath, getOutputPath } from './util';
import { build } from './builder';


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
    const configOutputDir = selectedConfig.local?.outputDir;
    if (!configOutputDir) {
        // 输出目录为空
        vscode.window.showErrorMessage('The output directory cannot be set to empty.');
        openSettings();
        return;
    }
    outputMsg('Start packing and compress...');
    const realOutputPath = getOutputPath(configOutputDir);
    const currentTime = new Date().getTime();
    const outputFilepath = `${realOutputPath}-${currentTime}.tar.gz`;
    await compress(realOutputPath!, outputFilepath);
    const outputFilename = path.parse(outputFilepath).base;
    outputMsg('Packaging and compression completed.\nThe output file name is ' + outputFilepath);

    // 建立 SSH 连接
}

