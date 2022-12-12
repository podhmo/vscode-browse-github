"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const resolve = require("./resolve");
async function guessRootDirectory() {
    const fs = vscode_1.workspace.fs;
    const candidates = vscode_1.workspace.workspaceFolders;
    if (candidates == null) {
        throw new Error('git repository directory candidates are empty');
    }
    // TODO: scan recursively
    for (const wf of candidates) {
        try {
            await fs.stat(vscode_1.Uri.joinPath(wf.uri, '.git/config'));
            return wf.uri;
        }
        catch (e) {
            // skip
        }
    }
    throw new Error('git repository directory is not found');
}
async function browseGithub({ getBranch, branch }) {
    const editor = vscode_1.window.activeTextEditor;
    if (editor === undefined) {
        void vscode_1.window.showErrorMessage('The active editor is not found');
        return;
    }
    const wf = vscode_1.workspace.getWorkspaceFolder(editor.document.uri);
    if (wf === undefined) {
        void vscode_1.window.showErrorMessage('Please, set the workspace folder');
        return;
    }
    const document = editor.document;
    const selection = editor.selection;
    try {
        const repoDirUri = await guessRootDirectory();
        const relPath = document.uri.fsPath.replace(repoDirUri.fsPath + '/', '');
        if (branch === undefined || branch === '') {
            branch = getBranch({ cwd: repoDirUri.fsPath });
        }
        const info = resolve.parse({ file: relPath, branch, cwd: repoDirUri.fsPath });
        info.start = selection.active.line + 1;
        if (selection.start !== selection.end) {
            info.start = document.lineAt(selection.start).lineNumber + 1;
            info.end = document.lineAt(selection.end).lineNumber + 1;
        }
        const repoURL = resolve.build(info);
        void vscode_1.env.openExternal(vscode_1.Uri.parse(repoURL));
    }
    catch (err) {
        if (err instanceof Error) {
            await vscode_1.window.showErrorMessage(`${err.message}`);
        }
        else if (typeof err === 'string') {
            await vscode_1.window.showErrorMessage(`${err}`);
        }
        else {
            await vscode_1.window.showErrorMessage('unexpected error');
        }
    }
}
function activate(context) {
    console.log('Congratulations, your extension "vscode-browse-github" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    {
        const disposable = vscode_1.commands.registerCommand('browse-github.with-current-branch', async () => {
            await browseGithub({ getBranch: resolve.currentBranch });
        });
        context.subscriptions.push(disposable);
    }
    {
        const disposable = vscode_1.commands.registerCommand('browse-github.with-default-branch', async () => {
            const configuration = vscode_1.workspace.getConfiguration('browse-github');
            let branch;
            if (configuration.has('default-branch')) {
                branch = configuration.get('default-branch');
            }
            await browseGithub({ branch, getBranch: resolve.defaultBranch });
        });
        context.subscriptions.push(disposable);
    }
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map