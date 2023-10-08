// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { start } from './main'
import { outputMsg } from './util'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "easy-deployment" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const buildAndDeployDisposable = vscode.commands.registerCommand('easy-deployment.buildAndDeploy', () => execute(false))

  const deployOnlyDisposable = vscode.commands.registerCommand('easy-deployment.deployOnly', () => execute(true))

  context.subscriptions.push(buildAndDeployDisposable, deployOnlyDisposable)
}

// The code you place here will be executed every time your command is executed
function execute(deployOnly: boolean) {
  try {
    start(deployOnly)
  } catch (err) {
    outputMsg(`An error occurred:\n${(err as Error).message}`)
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
