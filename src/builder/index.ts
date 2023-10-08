import * as vscode from 'vscode'
import { openSettings, outputMsg } from '../util'
import type { Configuration } from '../model/config'
import { displayName } from '../../package.json'
import { execute } from './executor'

export async function build(selectedConfig: Configuration, buildPath: string): Promise<boolean> {
  const buildCmd = selectedConfig.local.buildCmd
  if (!buildCmd) {
    // 构建命令为空
    vscode.window.showErrorMessage('`local.buildCmd` property is not configured or empty.')
    openSettings()
    return Promise.resolve(false)
  }
  outputMsg('Building, please wait a moment...\n')
  const buildPromise = execute(buildCmd, buildPath)

  vscode.window.withProgress(
    {
      title: `${displayName}: Building...`,
      location: vscode.ProgressLocation.Window,
    },
    () => buildPromise,
  )

  return buildPromise.then(({ stdout, stderr }) => {
    outputMsg(`output:\n${stdout + stderr || '(Empty)'}`)
    outputMsg('\nBuild successfully!\n')
    return Promise.resolve(true)
  }).catch((err) => {
    console.log(err)
    outputMsg(`ERROR: ${err.message}`)
    outputMsg('\nBuild failed, cancel deployment.\n')
    return Promise.resolve(false)
  })
}
