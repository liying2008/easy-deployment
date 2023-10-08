import * as path from 'node:path'
import * as fs from 'node:fs'
import * as vscode from 'vscode'
import { Uri } from 'vscode'

/**
 * 获取当前项目的绝对路径
 */
export function getProjectPath(): string | undefined {
  const workspaceName = vscode.workspace.name
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    return undefined
  }

  let fsPath
  workspaceFolders!.forEach((folder: vscode.WorkspaceFolder) => {
    if (folder.name === workspaceName) {
      fsPath = folder.uri.fsPath
    }
  })
  return fsPath
}

/**
 * 在编辑器中打开工作区的 settings.json 文件
 */
export async function openSettings() {
  const projectPath = getProjectPath()
  if (projectPath === undefined) {
    vscode.window.showErrorMessage('No open workspace!')
    return
  }
  const settingsPath = path.join(projectPath, './.vscode/settings.json')
  const uri = Uri.file(settingsPath)
  const exist = fs.existsSync(settingsPath)
  if (!exist) {
    fs.writeFileSync(settingsPath, '{}')
  }

  const _success = await vscode.commands.executeCommand('vscode.open', uri)
}

/**
 * 删除路径结尾的 / 或 \\ （如果存在的话）
 * @param pathname path
 */
export function trimTrailingSlash(pathname: string): string {
  if (pathname === '/') {
    return pathname
  }

  if (pathname.endsWith('\\') || pathname.endsWith('/')) {
    return pathname.substring(0, pathname.length - 1)
  } else {
    return pathname
  }
}

/**
 * 如果文件存在则删除
 * @param filepath 文件路径
 */
export function removeIfExist(filepath: string) {
  if (fs.existsSync(filepath)) {
    // 删除文件
    fs.unlinkSync(filepath)
  }
}

export function getFormattedCurrentTime(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${year}${month}${day}${hour}${minute}${second}`
}
