export interface Config {
  configurations: Array<Configuration>
}

export interface Configuration {
  name: string
  ssh: SSHConfiguration
  local: LocalConfiguration
  remote: RemoteConfiguration
}

export interface SSHConfiguration {
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
  passphrase?: string
}

export interface LocalConfiguration {
  projectPath?: string
  outputDir: string
  buildCmd: string
}

export interface RemoteConfiguration {
  deploymentPath: string
  backupOriginalFiles: boolean
  backupTo: string
  deleteOriginalFiles: boolean
  postCmd: string
}
