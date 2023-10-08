export interface Config {
  /**
   * Configuration list
   */
  configurations: Configuration[]
}

export interface Configuration {
  /**
   * Profile name
   */
  name: string
  /**
   * SSH configuration for connecting to remote server
   */
  ssh: SSHConfiguration
  /**
   * Configuration of local project
   */
  local: LocalConfiguration
  /**
   * Configuration of remote server
   */
  remote: RemoteConfiguration
}

export interface SSHConfiguration {
  /**
   * Hostname or IP address of the server
   */
  host: string
  /**
   * Port number of the server
   *
   * @default 22
   */
  port: number
  /**
   * Username for authentication
   */
  username: string
  /**
   * Password for password-based user authentication
   */
  password?: string
  /**
   * Private key (absolute path) for either key-based or hostbased user authentication (OpenSSH format)
   */
  privateKey?: string
  /**
   * For an encrypted private key, this is the passphrase used to decrypt it.
   */
  passphrase?: string
}

export interface LocalConfiguration {
  /**
   * Project root path (relative path)
   *
   * @default "."
   */
  projectPath?: string
  /**
   * Compiled product output path (relative path)
   *
   * @default "dist"
   */
  outputDir: string
  /**
   * Build command for local project
   */
  buildCmd?: string
}

export interface RemoteConfiguration {
  /**
   * Remote deployment path (absolute path)
   */
  deploymentPath: string
  /**
   * Do you need to back up the original files?
   *
   * @default false
   */
  backupOriginalFiles?: boolean
  /**
   * Backup path (absolute path) of the original files
   *
   * @default "~/backup"
   */
  backupTo?: string
  /**
   * Do you need to delete the original files?
   *
   * @default false
   */
  deleteOriginalFiles?: boolean
  /**
   * Command executed after deployment
   */
  postCmd?: string
}
