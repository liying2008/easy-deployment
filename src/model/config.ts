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
   * Build command for local project
   */
  buildCmd?: string
  /**
   * Compiled product output path. (path relative to the projectPath)
   *
   * @default "dist"
   */
  outputDir: string
  /**
   * Files excluded on deployment. (path pattern relative to the outputDir)
   *
   * @default []
   */
  exclude?: string[]
}

export interface RemoteConfiguration {
  /**
   * Remote deployment path. (must be an absolute path)
   */
  deploymentPath: string
  /**
   * Do you need to back up the original files?
   *
   * @default false
   */
  backupOriginalFiles?: boolean
  /**
   * Backup path of the original files. (must be an absolute path)
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
