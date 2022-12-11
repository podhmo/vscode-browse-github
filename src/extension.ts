import { window, commands, workspace, Uri, ExtensionContext } from 'vscode'
import * as resolve from './resolve'

async function guessRootDirectory (): Promise<Uri> {
  const fs = workspace.fs
  const candidates = workspace.workspaceFolders
  if (candidates == null) {
    throw new Error('git repository directory candidates are empty')
  }

  // TODO: scan recursively
  for (const wf of candidates) {
    try {
      await fs.stat(Uri.joinPath(wf.uri, '.git/config'))
      return wf.uri
    } catch (e) {
      // skip
    }
  }
  throw new Error('git repository directory is not found')
}

export function activate (context: ExtensionContext): void {
  console.log('Congratulations, your extension "vscode-browse-github" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = commands.registerCommand('browse-github.helloWorld', async () => {
    // const githubURL = resolve.url({ file: 'src/extension.ts', lineno: 8 })
    // console.log(githubURL)
    // return vscode.env.openExternal(vscode.Uri.parse(githubURL))

    const editor = window.activeTextEditor
    if (editor === undefined) {
      void window.showErrorMessage('The active editor is not found')
      return
    }

    const wf = workspace.getWorkspaceFolder(editor.document.uri)
    if (wf === undefined) {
      void window.showErrorMessage('Please, set the workspace folder')
      return
    }

    const document = editor.document
    // const selection = editor.selection
    try {
      const repoDirUri = await guessRootDirectory()
      const relPath = document.uri.fsPath.replace(repoDirUri.fsPath, './')
      const repoURL = resolve.url({ branch: 'master', file: relPath })
      void window.showInformationMessage(`browse github ${repoURL}`)
    } catch (err) {
      console.log(err)
      if (err instanceof Error) {
        await window.showErrorMessage(`${err.message}`)
      } else if (typeof err === 'string') {
        await window.showErrorMessage(`${err}`)
      } else {
        await window.showErrorMessage('unexpected error')
      }
    }

    // const start = document.lineAt(selection.start).lineNumber
    // const end = document.lineAt(selection.end).lineNumber

    // const text = document.getText(selection)
    // void window.showInformationMessage(`
    // workspace:${wf.uri.fsPath}
    // file:${document.uri.fsPath}
    // selection:${start} ~ ${end}

    // ${text}`)
  })

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate (): void { }
