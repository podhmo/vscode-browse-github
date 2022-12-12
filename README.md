# vscode-browse-github 

browsing github from current file.

## Features

commands

- browse-github.with-current-branch
- browse-github.with-default-branch

## Extension Settings

This extension contributes the following settings:

* `browse-github.default-branch`: Set default branch.

## manual install

see: https://code.visualstudio.com/api/advanced-topics/remote-extensions#installing-a-development-version-of-your-extension

```console
$ DOCKER_BUILDKIT=1 docker build --tag vsce "https://github.com/microsoft/vscode-vsce.git#main"
$ docker run --rm -it -v "$(pwd)":/workspace vsce package
```

## Release Notes

### 0.1.0

Initial release
