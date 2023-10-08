import type { Config } from '../model/config'

// 配置结构
const _config: Config = {
  configurations: [{
    name: 'dev',
    local: {
      projectPath: '.',
      outputDir: 'dist',
      buildCmd: 'yarn build',
    },
    remote: {
      deploymentPath: '~/test/demoDev',
      backupOriginalFiles: false,
      backupTo: '~/backup',
      deleteOriginalFiles: false,
      postCmd: '',
    },
    ssh: {
      host: '192.168.1.200',
      port: 22,
      username: 'pi',
      password: '123456',
      privateKey: undefined,
      passphrase: undefined,
    },
  }],
}
