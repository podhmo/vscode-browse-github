import * as vscode from 'vscode'
import * as resolve from './resolve'

export function activate (context: vscode.ExtensionContext): void {
  console.log('Congratulations, your extension "vscode-browse-github" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('browse-github.helloWorld', () => {
    // const githubURL = resolve.url({ file: 'src/extension.ts', lineno: 8 })
    // console.log(githubURL)
    // return vscode.env.openExternal(vscode.Uri.parse(githubURL))

    const editor = vscode.window.activeTextEditor
    if (editor === undefined) {
      return
    }

    const fspath = editor.document.uri.fsPath
    vscode.window.showInformationMessage(`browse github from ${fspath}`).then(() => {
    }).then(() => {}, (err: any) => { console.log(err); void vscode.window.showErrorMessage(err) })
  })

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate (): void { }
