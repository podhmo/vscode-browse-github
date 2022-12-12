import { execSync } from 'child_process'

interface Info {
  owner: string
  branch: string
  repository: string
  file: string

  start: number // lineno
  end: number // lineno

  raw: { url: string, file?: string }
}

interface Params {
  branch?: string
  owner?: string
  repository?: string

  cwd?: string

  file?: string
}

export function build (info: Info): string {
  const parts: string[] = [`https://github.com/${info.owner}/${info.repository}/`]
  if (info.branch !== '') {
    parts.push(`tree/${info.branch}/`)
  }
  if (info.file !== '') {
    parts.push(info.file)
  }
  if (info.start > 0) {
    parts.push(`#L${info.start}`)
    if (info.end > 0 && info.start !== info.end) {
      parts.push(`-#L${info.end}`)
    }
  }
  return parts.join('')
}

export function parse ({ branch, owner, repository, file, cwd }: Params): Info {
  if (branch === undefined || branch === '') {
    branch = currentBranch({ cwd })
  }

  const originURL = execSync('git config --get remote.origin.url', { cwd }).toString().trim()
  return parseFromURL({ branch, owner, repository, file }, originURL)
}

export function parseFromURL ({ branch, owner, repository, file }: Params, originURL: string): Info {
  if (branch === undefined) {
    branch = 'main'
  }
  if (owner === undefined) {
    owner = ''
  }
  if (repository === undefined) {
    repository = ''
  }
  if (file === undefined) {
    file = ''
  }

  if (owner === '' || repository === '') {
    const patterns = [
      // e.g. git@github.com:<owner>/<repository>.git
      /^git@github.com:([^/]+)\/([^/]+)(?:|\.git)$/,
      // e.g. https://github.com/<owner>/<repository>
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)/,
      // e.g. ssh://git@github.com/<owner>/<repository>
      /^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+)/
    ]
    for (const p of patterns) {
      const m = p.exec(originURL)
      if (m !== null) {
        owner = m[1]
        repository = m[2]
        break
      }
    }
  }
  return { owner, branch, repository, file, start: 0, end: 0, raw: { url: originURL } }
}

export function currentBranch ({ cwd }: { cwd?: string }): string {
  return execSync('git branch --show-current', { cwd }).toString().trim()
}
export function defaultBranch ({ cwd }: { cwd?: string }): string {
  const parts = execSync('git symbolic-ref refs/remotes/origin/HEAD', { cwd }).toString().trim().split('/')
  return parts[parts.length - 1]
}

// test code
if (require.main === module) {
  console.log(parseFromURL({ branch: 'master' }, 'ssh://git@github.com/podhmo/vscode-browse-github'))
  console.log(parseFromURL({ branch: 'master' }, 'https://github.com/podhmo/vscode-browse-github.git'))
  console.log(build(parse({ branch: 'master', file: './src/extension.ts' })))
}
