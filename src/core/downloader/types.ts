type GitHubSource = {
  kind: 'github'
  owner: string
  repository: string
  path: string
  ref: string
}

type UrlSource = {
  kind: 'url'
  url: string
}

type LocalSource = {
  kind: 'local'
  filePath: string
}

type DownloadSource = GitHubSource | UrlSource | LocalSource

type DownloadedFile = {
  content: string | Buffer
  source: DownloadSource
}

export type {
  DownloadedFile,
  DownloadSource,
  GitHubSource,
  LocalSource,
  UrlSource,
}
