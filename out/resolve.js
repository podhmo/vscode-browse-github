"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultBranch = exports.currentBranch = exports.parseFromURL = exports.parse = exports.build = void 0;
const child_process_1 = require("child_process");
function build(info) {
    const parts = [`https://github.com/${info.owner}/${info.repository}/`];
    if (info.branch !== '') {
        parts.push(`tree/${info.branch}/`);
    }
    if (info.file !== '') {
        parts.push(info.file);
    }
    if (info.start > 0) {
        parts.push(`#L${info.start}`);
        if (info.end > 0 && info.start !== info.end) {
            parts.push(`-#L${info.end}`);
        }
    }
    return parts.join('');
}
exports.build = build;
function parse({ branch, owner, repository, file, cwd }) {
    if (branch === undefined || branch === '') {
        branch = currentBranch({ cwd });
    }
    const originURL = (0, child_process_1.execSync)('git config --get remote.origin.url', { cwd }).toString().trim();
    return parseFromURL({ branch, owner, repository, file }, originURL);
}
exports.parse = parse;
function parseFromURL({ branch, owner, repository, file }, originURL) {
    if (branch === undefined) {
        branch = 'main';
    }
    if (owner === undefined) {
        owner = '';
    }
    if (repository === undefined) {
        repository = '';
    }
    if (file === undefined) {
        file = '';
    }
    if (owner === '' || repository === '') {
        const patterns = [
            // e.g. git@github.com:<owner>/<repository>.git
            /^git@github.com:([^/]+)\/([^/]+)(?:|\.git)$/,
            // e.g. https://github.com/<owner>/<repository>
            /^https:\/\/github\.com\/([^/]+)\/([^/]+)/,
            // e.g. ssh://git@github.com/<owner>/<repository>
            /^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+)/
        ];
        for (const p of patterns) {
            const m = p.exec(originURL);
            if (m !== null) {
                owner = m[1];
                repository = m[2];
                break;
            }
        }
    }
    return { owner, branch, repository, file, start: 0, end: 0, raw: { url: originURL } };
}
exports.parseFromURL = parseFromURL;
function currentBranch({ cwd }) {
    return (0, child_process_1.execSync)('git branch --show-current', { cwd }).toString().trim();
}
exports.currentBranch = currentBranch;
function defaultBranch({ cwd }) {
    const parts = (0, child_process_1.execSync)('git symbolic-ref refs/remotes/origin/HEAD', { cwd }).toString().trim().split('/');
    return parts[parts.length - 1];
}
exports.defaultBranch = defaultBranch;
// test code
if (require.main === module) {
    console.log(parseFromURL({ branch: 'master' }, 'ssh://git@github.com/podhmo/vscode-browse-github'));
    console.log(parseFromURL({ branch: 'master' }, 'https://github.com/podhmo/vscode-browse-github.git'));
    console.log(build(parse({ branch: 'master', file: './src/extension.ts' })));
}
//# sourceMappingURL=resolve.js.map