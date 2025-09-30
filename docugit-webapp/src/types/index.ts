export interface User {
  id: string
  email: string
  githubId: string
  repositories: Repository[]
  projects: Project[]
  subscription?: Subscription
}

export interface Project {
  id: string
  userId: string
  repositoryUrl: string
  sections: Section[]
  theme: Theme
  settings: Settings
  versions: Version[]
  createdAt: Date
  updatedAt: Date
}

export interface Section {
  id: string
  type: SectionType
  title: string
  content: string
  order: number
  enabled: boolean
  customFields?: Record<string, any>
}

export interface Repository {
  id: string
  name: string
  fullName: string
  description?: string
  url: string
  cloneUrl: string
  defaultBranch: string
  createdAt: string
  updatedAt: string
  stargazersCount: number
  forksCount: number
  watchersCount: number
  openIssuesCount: number
  size: number
  license?: string
  topics: string[]
  languages: Record<string, number>
  primaryLanguage: string
  projectType: string
  hasPackageJson: boolean
  hasReadme: boolean
  hasLicense: boolean
  hasDockerfile: boolean
  hasGitignore: boolean
  hasEslint: boolean
  hasPrettier: boolean
  hasTypeScript: boolean
  hasTailwind: boolean
  hasTests: boolean
  packageJson?: any
  scripts: Record<string, string>
  stats: {
    hasCommits: boolean
    hasReleases: boolean
    hasIssues: boolean
    hasPulls: boolean
  }
  contributors: Contributor[]
  owner: {
    login: string
    avatarUrl: string
    htmlUrl: string
    type: string
  }
}

export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
  fonts: {
    heading: string
    body: string
  }
}

export interface Settings {
  autoGenerate: boolean
  includeContributors: boolean
  includeBadges: boolean
  includeTableOfContents: boolean
}

export interface Version {
  id: string
  projectId: string
  version: string
  changes: string[]
  createdAt: Date
}

export interface Contributor {
  id: string
  login: string
  avatarUrl: string
  contributions: number
  htmlUrl: string
}

export interface Subscription {
  id: string
  userId: string
  plan: 'free' | 'pro' | 'team' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired'
  currentPeriodEnd: Date
}

export type SectionType =
  | 'header'
  | 'overview'
  | 'installation'
  | 'usage'
  | 'api'
  | 'testing'
  | 'contributing'
  | 'license'
  | 'changelog'
  | 'custom'

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  default_branch: string
  languages_url: string
  contributors_url: string
  contents_url: string
  readme_url?: string
  license?: {
    name: string
    spdx_id: string
  }
}