// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { start } from './main';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "easy-deployment" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let buildAndDeployDisposable = vscode.commands.registerCommand('easy-deployment.buildAndDeploy', (path) => execute(path, false));

	let deployOnlyDisposable = vscode.commands.registerCommand('easy-deployment.deployOnly', (path) => execute(path, true));

	context.subscriptions.push(buildAndDeployDisposable, deployOnlyDisposable);
}

// The code you place here will be executed every time your command is executed
function execute(path: any, deployOnly: boolean) {
	console.log('path', path);
	// 如果从命令进入，则path为空，从explorer右键菜单进入，则 path.fsPath 为所选绝对路径
	if (path && path.fsPath) {
		// 使用选择的路径
		start(path.fsPath, deployOnly);
	} else {
		// 使用配置路径
		start(undefined, deployOnly);
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
