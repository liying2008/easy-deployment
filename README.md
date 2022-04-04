# Easy Deployment 

[![Version](https://vsmarketplacebadge.apphb.com/version-short/liying.easy-deployment.svg)](https://marketplace.visualstudio.com/items?itemName=liying.easy-deployment)
[![Installs](https://vsmarketplacebadge.apphb.com/installs-short/liying.easy-deployment.svg)](https://marketplace.visualstudio.com/items?itemName=liying.easy-deployment)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-short/liying.easy-deployment.svg)](https://marketplace.visualstudio.com/items?itemName=liying.easy-deployment)

**Deploy your frontend project quickly and easily.**


## Features

- Select "Build & Deploy" to build your project and deploy it to a remote server. 
- Selecting "Deploy Only" will only execute the deployment process.

![Extension menus](https://raw.githubusercontent.com/liying2008/easy-deployment/master/pics/extension_commands.png)

Commands in command palette:

![Command palette](https://raw.githubusercontent.com/liying2008/easy-deployment/master/pics/command_palette.png)

## Extension Settings

This extension contributes the following settings:

```json
{
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
          "privateKey": "~/.ssh/id_rsa",
          "passphrase": ""
        }
      }
    ]
  }
}
```

**Details for each configuration item are as follows:**

* `local` configuration (Configuration of local project):

  |  Key   | Defaults | Description |
  |  ----  | ----  | ----  |
  | `projectPath`  | . | Project root path (relative path) |
  | `buildCmd`  | yarn build | Build command for local project |
  | `outputDir`  | dist | Compiled product output path (relative path) |

* `remote` configuration (Configuration of remote server):

  |  Key   | Defaults | Description |
  |  ----  | ----  | ----  |
  | `deploymentPath`  |  | Remote deployment path (absolute path) |
  | `backupOriginalFiles`  | false | Do you need to back up the original files? |
  | `backupTo`  | ~/backup | Backup path (absolute path) of the original files |
  | `deleteOriginalFiles`  | false | Do you need to delete the original files? |
  | `postCmd`  |  | Command executed after deployment |

* `ssh` configuration (Configuration of ssh connection):

  |  Key   | Defaults | Description |
  |  ----  | ----  | ----  |
  | `host`  |  | Hostname or IP address of the server |
  | `port`  | 22 | Port number of the server |
  | `username`  |  | Username for authentication |
  | `password`  |  | Password for password-based user authentication |
  | `privateKey`  |  | Private key (absolute path) for either key-based or hostbased user authentication (OpenSSH format) |
  | `passphrase`  |  | For an encrypted private key, this is the passphrase used to decrypt it. |

**Note:**

* Please set it according to your actual needs.
* You can choose between `password` and `privateKey` in the ssh configuration.
* If you use `privateKey`, remember to put the local ssh public key into the server's `authorized_keys` file.
* If you use `privateKey` and the `privateKey` is encrypted, fill in the `passphrase` field.
* The remote server needs to be a **Linux** machine.
* There can be multiple configurations in the outer configurations, and the `name` attribute cannot be repeated.


## Quick Start

- Install [Easy Deployment](https://marketplace.visualstudio.com/items?itemName=liying.easy-deployment).
- Configure `easyDeployment.config` in `settings.json` in the workspace.
- Right click in Explorer and select `Build & Deploy` or `Deploy Only`.


## Thanks

- [archiverjs/node-archiver](https://github.com/archiverjs/node-archiver)
- [steelbrain/node-ssh](https://github.com/steelbrain/node-ssh)


## Source Code

[https://github.com/liying2008/easy-deployment](https://github.com/liying2008/easy-deployment)

Binary package can be obtained from [this link.](https://marketplace.visualstudio.com/items?itemName=liying.easy-deployment)


## License

MIT © [Li Ying](https://github.com/liying2008) 
