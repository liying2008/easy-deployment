interface Config {
    configurations: Array<Configuration>
}

interface Configuration {
    name: string
    ssh: SSHConfiguration
    local: LocalConfiguration
    remote: RemoteConfiguration
}

interface SSHConfiguration {
    host: string
    port: number
    username: string
    password?: string
    privateKey?: string
}

interface LocalConfiguration {
    projectPath?: string
    outputDir: string
    buildCmd: string
}

interface RemoteConfiguration {
    deploymentPath: string
    backupOriginalFiles: boolean
    backupTo: string
    deleteOriginalFiles: boolean
    postCmd: string
}
