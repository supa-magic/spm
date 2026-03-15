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
  content: string
  source: DownloadSource
}

export type {
  DownloadSource,
  DownloadedFile,
  GitHubSource,
  LocalSource,
  UrlSource,
}
