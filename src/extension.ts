import { env, window, commands, workspace, Uri, ExtensionContext } from 'vscode'
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

async function browseGithub ({ getBranch, branch }: { branch?: string, getBranch: ({ cwd }: { cwd?: string }) => Promise<string> }): Promise<void> {
  const editor = window.activeTextEditor
  if (editor === undefined) {
    void window.showErrorMessage('The active editor is not found')
    return
  }

  if (workspace.getWorkspaceFolder(editor.document.uri) === undefined) {
    void window.showErrorMessage('Please, set the workspace folder')
    return
  }

  const document = editor.document
  const selection = editor.selection
  try {
    const repoDirUri = await guessRootDirectory()
    const relPath = document.uri.fsPath.replace(repoDirUri.fsPath + '/', '')

    if (branch === undefined || branch === '') {
      branch = await getBranch({ cwd: repoDirUri.fsPath })
    }
    const info = await resolve.parse({ file: relPath, branch, cwd: repoDirUri.fsPath })
    info.start = selection.active.line + 1
    if (selection.start !== selection.end) {
      info.start = document.lineAt(selection.start).lineNumber + 1
      info.end = document.lineAt(selection.end).lineNumber + 1
    }

    const repoURL = resolve.build(info)
    void env.openExternal(Uri.parse(repoURL))
  } catch (err) {
    if (err instanceof Error) {
      await window.showErrorMessage(`${err.message}`)
    } else if (typeof err === 'string') {
      await window.showErrorMessage(`${err}`)
    } else {
      await window.showErrorMessage('unexpected error')
    }
  }
}

export function activate (context: ExtensionContext): void {
  console.log('Congratulations, your extension "vscode-browse-github" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  {
    const disposable = commands.registerCommand('browse-github.with-current-branch', async () => {
      await browseGithub({ getBranch: resolve.currentBranch })
    })
    context.subscriptions.push(disposable)
  }
  {
    const disposable = commands.registerCommand('browse-github.with-default-branch', async () => {
      const configuration = workspace.getConfiguration('browse-github')
      let branch: string | undefined
      if (configuration.has('default-branch')) {
        branch = configuration.get('default-branch')
      }
      await browseGithub({ branch, getBranch: resolve.defaultBranch })
    })
    context.subscriptions.push(disposable)
  }
}

// This method is called when your extension is deactivated
export function deactivate (): void { }
