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
        },
        ssh: {
            host: "192.168.1.200",
            port: 22,
            username: "pi",
            password: "123456",
        }
    }]
};

export = config;
