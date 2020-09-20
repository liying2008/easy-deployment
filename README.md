# Easy Deployment 

[![Version](https://vsmarketplacebadge.apphb.com/version-short/liying.easy-deployment.svg)](https://marketplace.visualstudio.com/items?itemName=liying.easy-deployment)
[![Installs](https://vsmarketplacebadge.apphb.com/installs-short/liying.easy-deployment.svg)](https://marketplace.visualstudio.com/items?itemName=liying.easy-deployment)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-short/liying.easy-deployment.svg)](https://marketplace.visualstudio.com/items?itemName=liying.easy-deployment)

**Deploy your frontend project quickly and easily.**


## Features

- Select "Build & deploy" to build your project and deploy it to a remote server. 
- Selecting "Deploy only" will only execute the deployment process.

![Extension menus](https://github.com/liying2008/easy-deployment/blob/master/pics/extension_commands.png)


## Extension Settings

This extension contributes the following settings:

```json
  "easyDeployment.config": {
    "configurations": [
      {
        "name": "dev",
        "local": {
          "projectPath": ".",
          "buildCmd": "yarn build",
          "outputDir": "dist/spa",
        },
        "remote": {
          "deploymentPath": "~/nginx/html",
          "backupOriginalFiles": true,
          "backupTo": "~/backup",
          "deleteOriginalFiles": true,
          "postCmd": "ls -alF"
        },
        "ssh": {
          "host": "192.168.1.200",
          "port": 22,
          "username": "pi",
          "password": "",
          "privateKey": "~/.ssh/id_rsa"
        }
      }
    ]
  }
```

* Please set it according to your actual needs.
* You can choose between `password` and `privateKey` in the ssh configuration.
* There can be multiple configurations in the outer configurations, and the `name` attribute cannot be repeated.


## Quick Start

- Install [Easy Deployment](https://marketplace.visualstudio.com/items?itemName=liying.easy-deployment).
- Configure `easyDeployment.config` in `settings.json` in the workspace.
- Right click in Explorer and select `Build & deploy` or `Deploy only`.


## License

MIT © [Li Ying](https://github.com/liying2008) 
