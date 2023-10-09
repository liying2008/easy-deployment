import * as path from 'node:path'
import * as vscode from 'vscode'
import type { Config, Configuration } from '../model/config'
import { getProjectPath, openSettings, trimTrailingSlash } from './misc'

/**
 * 获取使用的配置
 */
export async function getActivatedConfig(): Promise<Configuration | undefined> {
  // 获取配置
  const workspaceConfiguration = vscode.workspace.getConfiguration('easyDeployment')

  const config: Config = workspaceConfiguration.config
  console.log('config', config)

  const configurations = config.configurations
  console.log('configurations', configurations)
  if (!configurations || configurations.length === 0) {
    // 缺少 configurations 配置
    vscode.window.showErrorMessage('Missing configurations.')
    openSettings()
    return
  }
  // 获取配置名称列表
  const profileNames = configurations.map((value: Configuration) => {
    return value.name
  }).filter((value: string | undefined) => {
    return !!value
  })

  // console.log('profileNames', profileNames);
  if (!profileNames || profileNames.length === 0) {
    // 配置不完整
    vscode.window.showErrorMessage('Incomplete configuration.')
    openSettings()
    return
  }

  let selectedProfile: string | undefined
  if (profileNames.length > 1) {
    // 可选项大于1，显示选择
    selectedProfile = await vscode.window.showQuickPick(profileNames, {
      canPickMany: false,
      placeHolder: 'Please select a configuration',
    })
    console.log('selectedProfile', selectedProfile)
    if (selectedProfile === undefined) {
      // 没有选择任何 profile
      return
    }
  } else {
    // 可选项只有一个，默认选择即可
    selectedProfile = profileNames[0]
  }

  // 选中的配置
  return configurations.filter((value: Configuration) => {
    return value.name === selectedProfile
  })[0]
}

/**
 * 获取项目构建路径（绝对路径）
 *
 * @param configProjectPath 配置的项目构建根路径（相对路径）
 */
export function getBuildPath(configProjectPath: string | undefined): string | undefined {
  const projectPath = getProjectPath()
  if (projectPath === undefined) {
    vscode.window.showErrorMessage('No open workspace!')
    return undefined
  }
  if (configProjectPath === undefined) {
    configProjectPath = '.'
  }

  const absolutePath = trimTrailingSlash(path.normalize(path.join(projectPath, configProjectPath)))
  console.log('getBuildPath::absolutePath,', absolutePath)
  return absolutePath
}

/**
 * 获取编译输出路径（绝对路径）
 * @param configOutputDir 配置的输出目录（相对路径）
 */
export function getOutputPath(configOutputDir: string | undefined): string | undefined {
  const projectPath = getProjectPath()
  if (projectPath === undefined) {
    vscode.window.showErrorMessage('No open workspace!')
    return undefined
  }
  if (configOutputDir === undefined) {
    vscode.window.showErrorMessage('`local.outputDir` is not configured or empty.')
    return undefined
  }
  const absolutePath = trimTrailingSlash(path.normalize(path.join(projectPath, configOutputDir)))
  console.log('getOutputPath::absolutePath,', absolutePath)
  return absolutePath
}
