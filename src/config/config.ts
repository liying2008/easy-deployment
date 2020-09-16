// 配置结构
const config: Config = {
    configurations: [{
        name: 'dev',
        local: {
            projectPath: '.',
            outputDir: 'dist',
            buildCmd: 'yarn build'
        },
        remote: {
            deploymentPath: '~/test/demoDev',
            postCmd: '',
        },
        ssh: {
            host: "192.168.1.200",
            port: 22,
            username: "pi",
            password: "123456",
        }
    },
    {
        name: 'prod',
        local: {
            projectPath: '.',
            outputDir: 'dist',
            buildCmd: 'yarn build'
        },
        remote: {
            deploymentPath: '~/test/demoProd',
            postCmd: '',
        },
        ssh: {
            host: "192.168.1.200",
            port: 22,
            username: "pi",
            password: "123456",
        }
    }]
};
