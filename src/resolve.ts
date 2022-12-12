import { execSync } from 'child_process'

interface Info {
  owner: string
  branch: string
  repository: string
  file: string
  lineno: number

  raw: { url: string, lineno?: number, file?: string }
}

interface Params {
  branch?: string
  owner?: string
  repository?: string

  cwd?: string

  file?: string
  lineno?: number
}

export function build (info: Info): string {
  const parts: string[] = [`https://github.com/${info.owner}/${info.repository}/`]
  if (info.branch !== '') {
    parts.push(`tree/${info.branch}/`)
  }
  if (info.file !== '') {
    parts.push(info.file)
  }
  if (info.lineno !== 0) {
    parts.push(`#L${info.lineno}`)
  }
  return parts.join('')
}

export function parse ({ branch, owner, repository, file, lineno, cwd }: Params): Info {
  if (branch === undefined || branch === '') {
    branch = execSync('git branch --show-current', { cwd }).toString().trim()
  }

  const originURL = execSync('git config --get remote.origin.url', { cwd }).toString().trim()
  return parseFromURL({ branch, owner, repository, file, lineno }, originURL)
}

export function parseFromURL ({ branch, owner, repository, file, lineno }: Params, originURL: string): Info {
  if (branch === undefined) {
    branch = 'main'
  }
  if (owner === undefined) {
    owner = ''
  }
  if (repository === undefined) {
    repository = ''
  }
  if (lineno === undefined) {
    lineno = 0
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
  return { owner, branch, repository, file, lineno, raw: { url: originURL } }
}

if (require.main === module) {
  console.log(parseFromURL({ branch: 'master' }, 'ssh://git@github.com/podhmo/vscode-browse-github'))
  console.log(parseFromURL({ branch: 'master' }, 'https://github.com/podhmo/vscode-browse-github.git'))
  console.log(build(parse({ branch: 'master', file: './src/extension.ts', lineno: 8 })))
}
