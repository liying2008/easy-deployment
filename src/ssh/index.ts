import * as path from 'node:path'
import * as vscode from 'vscode'
import { NodeSSH } from 'node-ssh'
import { getFormattedCurrentTime, openSettings, outputMsg, trimTrailingSlash } from '../util'
import type { Configuration, RemoteConfiguration, SSHConfiguration } from '../model/config'

let ssh = new NodeSSH()

export async function deploy(selectedConfig: Configuration, outputFilepath: string): Promise<void> {
  const sshConfig = selectedConfig.ssh
  const remoteConfig = selectedConfig.remote
  if (!sshConfig || !sshConfig.host || !sshConfig.username) {
    // 未配置host或username
    vscode.window.showErrorMessage('`ssh.host` or `ssh.username` is not configured or empty.')
    openSettings()
    return Promise.reject(new Error('`ssh.host` or `ssh.username` is not configured or empty.'))
  }
  if (!remoteConfig || !remoteConfig.deploymentPath) {
    // 未配置远程部署路径
    vscode.window.showErrorMessage('`remote.deploymentPath` is not configured or empty.')
    openSettings()
    return Promise.reject(new Error('`remote.deploymentPath` is not configured or empty.'))
  }
  // 建立 ssh 连接
  outputMsg('Establish ssh connection.')
  const givenConfig: SSHConfiguration = {
    host: sshConfig.host,
    username: sshConfig.username,
    port: sshConfig.port || 22,
  }
  if (sshConfig.privateKey) {
    let privateKey = sshConfig.privateKey
    if (privateKey.startsWith('~/') || privateKey.startsWith('~\\')) {
      // ~ 替换为 用户 HOME 目录
      const userHome = process.env.HOME || process.env.USERPROFILE
      console.log('deploy::userHome', userHome)
      privateKey = path.join(userHome!, privateKey.substring(2, privateKey.length))
    }
    givenConfig.privateKey = privateKey
    givenConfig.passphrase = sshConfig.passphrase
  } else {
    givenConfig.password = sshConfig.password || ''
  }
  ssh = await ssh.connect(givenConfig)
  if (!ssh.isConnected()) {
    // 连接未建立
    outputMsg('\nConnection not established.')
    return Promise.reject(new Error('Connection not established.'))
  }

  // 上传文件
  let deploymentPath = remoteConfig.deploymentPath
  const outputFilename = path.parse(outputFilepath).base
  deploymentPath = getValidRemotePath(deploymentPath)
  // 去掉路径末尾的 /
  const parentDeploymentPath = trimTrailingSlash(path.posix.dirname(deploymentPath))

  const finalUploadPath = `${parentDeploymentPath}/${outputFilename}`
  console.log('finalUploadPath', finalUploadPath)
  outputMsg(`Upload ${outputFilepath} to ${finalUploadPath}`)
  // 开始上传文件
  try {
    await ssh.putFile(outputFilepath, finalUploadPath)
    outputMsg('\nUpload successfully')
  } catch (error) {
    console.log(error)
    outputMsg(`\nUpload failed:\n${(error as Error).message}`)
    // 断开连接
    ssh.dispose()
    return Promise.reject(error)
  }

  // 备份原有文件
  const backupOriginalFiles = !!remoteConfig.backupOriginalFiles
  if (backupOriginalFiles) {
    outputMsg('\nStart to backup original files')
    const success = await backupFiles(ssh, remoteConfig)
    if (success) {
      outputMsg('\nBackup successfully')
    } else {
      outputMsg('\nBackup failed, cancel deployment.')
      // 断开连接
      ssh.dispose()
      return Promise.reject(new Error('Backup failed, cancel deployment.'))
    }
  }

  // 删除原有文件
  const deleteOriginalFiles = !!remoteConfig.deleteOriginalFiles
  if (deleteOriginalFiles) {
    outputMsg('\nStart to delete original files')
    const success = await deleteFiles(ssh, remoteConfig)
    if (success) {
      outputMsg('\nDelete successfully')
    } else {
      outputMsg('\nDelete failed, cancel deployment.')
      // 断开连接
      ssh.dispose()
      return Promise.reject(new Error('Delete failed, cancel deployment.'))
    }
  }

  // 解压上传的文件，即部署
  outputMsg('\nStart to extract target file')
  const success = await extractFile(ssh, remoteConfig, finalUploadPath)
  if (success) {
    outputMsg('\nExtract successfully')
  } else {
    outputMsg('\nExtract failed. Deploy failed.')
    // 断开连接
    ssh.dispose()
    return Promise.reject(new Error('Extract failed. Deploy failed.'))
  }

  // 删除上传的文件
  console.log('删除上传的文件：', finalUploadPath)
  await deleteUploadedFile(ssh, finalUploadPath)

  // 执行后续命令
  const postCmd = remoteConfig.postCmd
  if (postCmd && postCmd.trim()) {
    outputMsg('\nStart to execute post command')
    const success = await executePostCmd(ssh, remoteConfig)
    if (success) {
      outputMsg('\nPost command executed successfully')
    } else {
      outputMsg('\nFailed to execute post command')
      // 断开连接
      ssh.dispose()
      return Promise.reject(new Error('Failed to execute post command'))
    }
  }
  // 断开连接
  ssh.dispose()
  return Promise.resolve()
}

async function backupFiles(ssh: NodeSSH, remoteConfig: RemoteConfiguration): Promise<boolean> {
  let deploymentPath = remoteConfig.deploymentPath
  let backupTo = remoteConfig.backupTo
  if (!backupTo) {
    // 缺少 backupTo 配置
    vscode.window.showErrorMessage('`remote.backupTo` property is not configured or empty.')
    openSettings()
    return Promise.resolve(false)
  }
  deploymentPath = getValidRemotePath(deploymentPath)
  backupTo = trimTrailingSlash(getValidRemotePath(backupTo))
  const basename = path.posix.basename(deploymentPath)

  const backupName = `${basename}-${getFormattedCurrentTime()}`
  const finalBackupPath = `${backupTo}/${backupName}`

  const command = `
        if [ ! -d "${backupTo}" ]; then
            mkdir -p "${backupTo}"
        fi
        if [ -e "${deploymentPath}" ]; then
            cp -prf "${deploymentPath}" "${finalBackupPath}"
        fi
    `
  console.log('backupFiles::command', command)

  const result = await ssh.execCommand(command)
  console.log(`backupFiles::CODE: ${result.code}`)
  console.log(`backupFiles::STDOUT: ${result.stdout}`)
  console.log(`backupFiles::STDERR: ${result.stderr}`)

  if (result.code !== null && result.code !== 0) {
    // 备份文件失败
    outputMsg(`\nBackup failed:${result.stderr}`)
    return Promise.resolve(false)
  }

  return Promise.resolve(true)
}

async function deleteFiles(ssh: NodeSSH, remoteConfig: RemoteConfiguration): Promise<boolean> {
  let deploymentPath = remoteConfig.deploymentPath
  deploymentPath = getValidRemotePath(deploymentPath)
  const dirname = path.posix.dirname(deploymentPath)
  const basename = path.posix.basename(deploymentPath)

  const command = `
        if [ -e "${basename}" ]; then
            if [ -f "${basename}" ]; then
                rm -f "${basename}"
            elif [ -d "${basename}" ]; then
                cd "${basename}" && ls -a -I . -I .. | xargs rm -rf
            fi
        fi
    `
  console.log('deleteFiles::command', command)

  const result = await ssh.execCommand(command, { cwd: dirname })
  console.log(`deleteFiles::CODE: ${result.code}`)
  console.log(`deleteFiles::STDOUT: ${result.stdout}`)
  console.log(`deleteFiles::STDERR: ${result.stderr}`)

  if (result.code !== null && result.code !== 0) {
    // 删除文件失败
    outputMsg(`\nDelete failed:${result.stderr}`)
    return Promise.resolve(false)
  }

  return Promise.resolve(true)
}

async function extractFile(ssh: NodeSSH, remoteConfig: RemoteConfiguration, zipPath: string): Promise<boolean> {
  let deploymentPath = remoteConfig.deploymentPath
  deploymentPath = getValidRemotePath(deploymentPath)

  const command = `
        if [ ! -d "${deploymentPath}" ]; then
            mkdir -p "${deploymentPath}"
        fi
        tar -xvf "${zipPath}" -C "${deploymentPath}"
    `
  console.log('extractFile::command', command)

  const result = await ssh.execCommand(command)
  console.log(`extractFile::CODE: ${result.code}`)
  console.log(`extractFile::STDOUT: ${result.stdout}`)
  console.log(`extractFile::STDERR: ${result.stderr}`)

  if (result.code !== null && result.code !== 0) {
    // 解压文件失败
    outputMsg(`\nExtract failed:${result.stderr}`)
    return Promise.resolve(false)
  }

  return Promise.resolve(true)
}

async function deleteUploadedFile(ssh: NodeSSH, zipPath: string): Promise<boolean> {
  const command = `rm -f "${zipPath}"`
  console.log('deleteUploadedFile::command', command)

  const result = await ssh.execCommand(command)
  console.log(`deleteUploadedFile::CODE: ${result.code}`)
  console.log(`deleteUploadedFile::STDOUT: ${result.stdout}`)
  console.log(`deleteUploadedFile::STDERR: ${result.stderr}`)

  if (result.code !== null && result.code !== 0) {
    // 删除文件失败
    return Promise.resolve(false)
  }

  return Promise.resolve(true)
}

async function executePostCmd(ssh: NodeSSH, remoteConfig: RemoteConfiguration): Promise<boolean> {
  let deploymentPath = remoteConfig.deploymentPath
  deploymentPath = getValidRemotePath(deploymentPath)
  deploymentPath = path.posix.normalize(deploymentPath)

  const postCmd = remoteConfig.postCmd!

  console.log('executePostCmd::command', postCmd)

  const result = await ssh.execCommand(postCmd, { cwd: deploymentPath })
  console.log(`executePostCmd::CODE: ${result.code}`)
  console.log(`executePostCmd::STDOUT: ${result.stdout}`)
  console.log(`executePostCmd::STDERR: ${result.stderr}`)

  // 输出执行结果
  outputMsg(`output:\n${result.stdout + result.stderr || '(Empty)'}`)

  if (result.code !== null && result.code !== 0) {
    // 执行命令失败
    return Promise.resolve(false)
  }

  return Promise.resolve(true)
}

function getValidRemotePath(remotePath: string) {
  if (remotePath.startsWith('~/')) {
    remotePath = `./${remotePath.substring(2)}`
  }

  return remotePath
}
