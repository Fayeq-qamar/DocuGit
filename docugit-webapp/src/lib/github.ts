import type { GitHubRepo, Repository } from '@/types'

export class GitHubService {
  private baseUrl = 'https://api.github.com'
  private accessToken?: string

  constructor(accessToken?: string) {
    this.accessToken = accessToken
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DocuGit-App',
      ...options.headers,
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    return this.fetch(`/repos/${owner}/${repo}`)
  }

  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    return this.fetch(`/repos/${owner}/${repo}/languages`)
  }

  async getRepositoryContents(owner: string, repo: string, path: string = ''): Promise<any[]> {
    return this.fetch(`/repos/${owner}/${repo}/contents/${path}`)
  }

  async getReadmeContent(owner: string, repo: string): Promise<string | null> {
    try {
      const readme = await this.fetch(`/repos/${owner}/${repo}/readme`)
      if (readme.content) {
        return atob(readme.content.replace(/\s/g, ''))
      }
      return null
    } catch (error) {
      return null
    }
  }

  async getContributors(owner: string, repo: string): Promise<any[]> {
    try {
      return this.fetch(`/repos/${owner}/${repo}/contributors`)
    } catch (error) {
      return []
    }
  }

  async getPackageJson(owner: string, repo: string): Promise<any | null> {
    try {
      const file = await this.fetch(`/repos/${owner}/${repo}/contents/package.json`)
      if (file.content) {
        const content = atob(file.content.replace(/\s/g, ''))
        return JSON.parse(content)
      }
      return null
    } catch (error) {
      return null
    }
  }

  async getRepoStats(owner: string, repo: string): Promise<any> {
    try {
      const [commits, releases, issues, pulls] = await Promise.all([
        this.fetch(`/repos/${owner}/${repo}/commits?per_page=1`).catch(() => []),
        this.fetch(`/repos/${owner}/${repo}/releases?per_page=1`).catch(() => []),
        this.fetch(`/repos/${owner}/${repo}/issues?state=all&per_page=1`).catch(() => []),
        this.fetch(`/repos/${owner}/${repo}/pulls?state=all&per_page=1`).catch(() => [])
      ])

      return {
        hasCommits: commits.length > 0,
        hasReleases: releases.length > 0,
        hasIssues: issues.length > 0,
        hasPulls: pulls.length > 0
      }
    } catch (error) {
      return {
        hasCommits: false,
        hasReleases: false,
        hasIssues: false,
        hasPulls: false
      }
    }
  }

  async analyzeSourceFiles(owner: string, repo: string, contents: any[], onProgress?: (progress: any) => void): Promise<any> {
    const sourceFiles = contents.filter(file =>
      file.type === 'file' && this.isSourceFile(file.name)
    )

    let totalComponents = 0
    let totalFunctions = 0
    let hasTests = false
    let apiEndpoints = []
    let componentNames = []
    let analyzedFiles = []

    // Analyze up to 20 source files to avoid rate limits
    const filesToAnalyze = sourceFiles.slice(0, 20)

    for (let i = 0; i < filesToAnalyze.length; i++) {
      const file = filesToAnalyze[i]

      const progressMessage = `📄 Reading ${file.name} (${i + 1}/${filesToAnalyze.length})`
      console.log(progressMessage)
      onProgress?.({
        current: 4,
        total: 10,
        message: progressMessage,
        percentage: 40 + (i / filesToAnalyze.length) * 10
      })

      try {
        const content = await this.getFileContent(owner, repo, file.path)
        if (content) {
          const analysis = this.analyzeFileContent(content, file.name)
          totalComponents += analysis.components
          totalFunctions += analysis.functions
          hasTests = hasTests || analysis.isTest
          apiEndpoints.push(...analysis.apiEndpoints)
          componentNames.push(...analysis.componentNames)

          analyzedFiles.push({
            name: file.name,
            path: file.path,
            size: file.size,
            analysis: {
              components: analysis.components,
              functions: analysis.functions,
              isTest: analysis.isTest,
              apiEndpoints: analysis.apiEndpoints.length,
              componentNames: analysis.componentNames.length
            }
          })
        }
      } catch (error) {
        console.log(`Could not analyze file: ${file.name}`)
      }
    }

    return {
      totalFiles: sourceFiles.length,
      analyzedFiles: filesToAnalyze.length,
      totalComponents,
      totalFunctions,
      hasTests,
      apiEndpoints: apiEndpoints.slice(0, 10), // Limit to 10 endpoints
      componentNames: componentNames.slice(0, 10), // Limit to 10 components
      sourceFileTypes: this.getFileTypes(sourceFiles),
      fileDetails: analyzedFiles // Detailed analysis per file
    }
  }

  async analyzeFrameworks(packageJson: any, sourceFiles: any): Promise<any> {
    const frameworks = []
    const uiLibraries = []
    const databases = []
    const tools = []

    if (packageJson?.dependencies || packageJson?.devDependencies) {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      // Frameworks
      if (deps.next) frameworks.push('Next.js')
      if (deps.react) frameworks.push('React')
      if (deps.vue) frameworks.push('Vue.js')
      if (deps.angular) frameworks.push('Angular')
      if (deps.express) frameworks.push('Express.js')
      if (deps.fastify) frameworks.push('Fastify')
      if (deps.nestjs || deps['@nestjs/core']) frameworks.push('NestJS')

      // UI Libraries
      if (deps['@mui/material'] || deps['material-ui']) uiLibraries.push('Material-UI')
      if (deps['tailwindcss']) uiLibraries.push('Tailwind CSS')
      if (deps['styled-components']) uiLibraries.push('Styled Components')
      if (deps['framer-motion']) uiLibraries.push('Framer Motion')
      if (deps['react-bootstrap']) uiLibraries.push('React Bootstrap')

      // Databases
      if (deps.mongoose || deps.mongodb) databases.push('MongoDB')
      if (deps.pg || deps.postgresql) databases.push('PostgreSQL')
      if (deps.mysql) databases.push('MySQL')
      if (deps.redis) databases.push('Redis')
      if (deps.firebase) databases.push('Firebase')

      // Tools
      if (deps.webpack) tools.push('Webpack')
      if (deps.vite) tools.push('Vite')
      if (deps.jest) tools.push('Jest')
      if (deps.cypress) tools.push('Cypress')
      if (deps.eslint) tools.push('ESLint')
      if (deps.prettier) tools.push('Prettier')
    }

    return { frameworks, uiLibraries, databases, tools }
  }

  async analyzeConfigFiles(owner: string, repo: string, contents: any[]): Promise<any> {
    const configFiles = {
      typescript: false,
      eslint: false,
      prettier: false,
      tailwind: false,
      docker: false,
      github_actions: false,
      testing: false
    }

    // Check for TypeScript
    if (contents.some(f => f.name === 'tsconfig.json')) {
      configFiles.typescript = true
    }

    // Check for ESLint
    if (contents.some(f => f.name.includes('eslint'))) {
      configFiles.eslint = true
    }

    // Check for Prettier
    if (contents.some(f => f.name.includes('prettier'))) {
      configFiles.prettier = true
    }

    // Check for Tailwind
    if (contents.some(f => f.name.includes('tailwind'))) {
      configFiles.tailwind = true
    }

    // Check for Docker
    if (contents.some(f => f.name.toLowerCase() === 'dockerfile')) {
      configFiles.docker = true
    }

    // Check for GitHub Actions
    try {
      const workflows = await this.getRepositoryContents(owner, repo, '.github/workflows')
      if (workflows && workflows.length > 0) {
        configFiles.github_actions = true
      }
    } catch (error) {
      // No GitHub Actions
    }

    // Check for testing config
    if (contents.some(f =>
      f.name === 'jest.config.js' ||
      f.name === 'cypress.json' ||
      f.name === 'vitest.config.js'
    )) {
      configFiles.testing = true
    }

    return configFiles
  }

  async analyzeProjectStructure(contents: any[], sourceFiles: any): Promise<any> {
    const directories = contents.filter(item => item.type === 'dir')
    const files = contents.filter(item => item.type === 'file')

    const structure = {
      totalDirectories: directories.length,
      totalFiles: files.length,
      hasSourceDir: directories.some(d => ['src', 'lib', 'app'].includes(d.name)),
      hasPublicDir: directories.some(d => d.name === 'public'),
      hasDocsDir: directories.some(d => ['docs', 'documentation'].includes(d.name)),
      hasTestsDir: directories.some(d => ['tests', 'test', '__tests__'].includes(d.name)),
      mainDirectories: directories.map(d => d.name).slice(0, 10)
    }

    return structure
  }

  private isSourceFile(filename: string): boolean {
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.py', '.go', '.rs', '.java', '.php']
    return extensions.some(ext => filename.toLowerCase().endsWith(ext))
  }

  private async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const file = await this.fetch(`/repos/${owner}/${repo}/contents/${path}`)
      if (file.content && file.size < 100000) { // Only analyze files under 100KB
        return atob(file.content.replace(/\s/g, ''))
      }
      return null
    } catch (error) {
      return null
    }
  }

  private analyzeFileContent(content: string, filename: string): any {
    const analysis = {
      components: 0,
      functions: 0,
      isTest: false,
      apiEndpoints: [],
      componentNames: []
    }

    // Check if it's a test file
    analysis.isTest = filename.toLowerCase().includes('test') ||
                     filename.toLowerCase().includes('spec') ||
                     content.includes('describe(') ||
                     content.includes('it(') ||
                     content.includes('test(')

    // Count React components
    const componentMatches = content.match(/(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/g)
    if (componentMatches) {
      analysis.components = componentMatches.length
      analysis.componentNames = componentMatches.map(match =>
        match.replace(/(?:function|const|class)\s+/, '')
      )
    }

    // Count functions
    const functionMatches = content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g)
    if (functionMatches) {
      analysis.functions = functionMatches.length
    }

    // Find API endpoints
    const apiMatches = content.match(/(?:app\.|router\.|api\.)(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi)
    if (apiMatches) {
      analysis.apiEndpoints = apiMatches.map(match => {
        const parts = match.match(/(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/i)
        return {
          method: parts?.[1]?.toUpperCase(),
          path: parts?.[2]
        }
      }).filter(Boolean)
    }

    return analysis
  }

  private getFileTypes(files: any[]): Record<string, number> {
    const types: Record<string, number> = {}

    files.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext) {
        types[ext] = (types[ext] || 0) + 1
      }
    })

    return types
  }

  async detectProjectType(contents: any[], packageJson: any, sourceFiles?: any): Promise<string> {
    // Check for framework-specific files and dependencies
    const fileNames = contents.map(file => file.name.toLowerCase())

    if (packageJson?.dependencies || packageJson?.devDependencies) {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      if (deps.next || fileNames.includes('next.config.js')) return 'nextjs'
      if (deps.react || deps['react-dom']) return 'react'
      if (deps.vue || fileNames.includes('vue.config.js')) return 'vue'
      if (deps.angular || fileNames.includes('angular.json')) return 'angular'
      if (deps.express || deps.fastify || deps.koa) return 'backend'
      if (deps.electron) return 'desktop'
      if (deps['react-native']) return 'mobile'
    }

    // Check for other project indicators
    if (fileNames.includes('dockerfile') || fileNames.includes('docker-compose.yml')) return 'containerized'
    if (fileNames.includes('requirements.txt') || fileNames.includes('pyproject.toml')) return 'python'
    if (fileNames.includes('cargo.toml')) return 'rust'
    if (fileNames.includes('go.mod')) return 'go'
    if (fileNames.includes('pom.xml') || fileNames.includes('build.gradle')) return 'java'

    return 'general'
  }

  async analyzeRepository(repoUrl: string, onProgress?: (progress: any) => void): Promise<Repository> {
    const { owner, repo } = this.parseGitHubUrl(repoUrl)

    // Step 1: Get basic repository data
    console.log("🔍 Step 1: Fetching repository metadata...")
    onProgress?.({
      current: 1,
      total: 10,
      message: "🔍 Fetching repository metadata...",
      percentage: 10
    })

    const [repoData, languages, contributors] = await Promise.all([
      this.getRepository(owner, repo),
      this.getRepositoryLanguages(owner, repo),
      this.getContributors(owner, repo)
    ])

    // Step 2: Get repository contents
    onProgress?.({
      current: 2,
      total: 10,
      message: "📂 Scanning repository structure...",
      percentage: 20
    })

    const contents = await this.getRepositoryContents(owner, repo)

    // Step 3: Analyze important files
    onProgress?.({
      current: 3,
      total: 10,
      message: "📋 Analyzing package.json and configuration...",
      percentage: 30
    })

    const [packageJson, readme] = await Promise.all([
      this.getPackageJson(owner, repo),
      this.getReadmeContent(owner, repo)
    ])

    // Step 4: Deep scan source files
    const sourceFileCount = contents.filter(file => file.type === 'file' && this.isSourceFile(file.name)).length
    onProgress?.({
      current: 4,
      total: 10,
      message: `🔍 Scanning ${sourceFileCount} source code files...`,
      percentage: 40
    })

    const sourceFiles = await this.analyzeSourceFiles(owner, repo, contents, onProgress)

    // Step 5: Analyze dependencies and frameworks
    onProgress?.({
      current: 5,
      total: 10,
      message: "🧩 Analyzing dependencies and frameworks...",
      percentage: 50
    })

    const frameworkAnalysis = await this.analyzeFrameworks(packageJson, sourceFiles)

    // Step 6: Check configuration files
    onProgress?.({
      current: 6,
      total: 10,
      message: "⚙️ Checking configuration files...",
      percentage: 60
    })

    const configFiles = await this.analyzeConfigFiles(owner, repo, contents)

    // Step 7: Analyze project structure
    onProgress?.({
      current: 7,
      total: 10,
      message: "🏗️ Analyzing project architecture...",
      percentage: 70
    })

    const projectStructure = await this.analyzeProjectStructure(contents, sourceFiles)

    // Step 8: Get repository statistics
    onProgress?.({
      current: 8,
      total: 10,
      message: "📊 Gathering repository statistics...",
      percentage: 80
    })

    const stats = await this.getRepoStats(owner, repo)

    // Step 9: Generate comprehensive analysis
    onProgress?.({
      current: 9,
      total: 10,
      message: "🧠 Processing analysis results...",
      percentage: 90
    })

    // Detect comprehensive file presence
    const hasPackageJson = contents.some(file => file.name === 'package.json')
    const hasLicense = contents.some(file => file.name.toLowerCase().includes('license'))
    const hasDockerfile = contents.some(file => file.name.toLowerCase() === 'dockerfile')
    const hasGitignore = contents.some(file => file.name === '.gitignore')
    const hasEslint = configFiles.eslint || contents.some(file => file.name.includes('eslint'))
    const hasPrettier = configFiles.prettier || contents.some(file => file.name.includes('prettier'))
    const hasTypeScript = configFiles.typescript || contents.some(file => file.name === 'tsconfig.json')
    const hasTailwind = configFiles.tailwind || contents.some(file => file.name.includes('tailwind'))
    const hasTests = sourceFiles.hasTests || contents.some(file =>
      file.name.toLowerCase().includes('test') ||
      file.name.toLowerCase().includes('spec') ||
      file.name === 'jest.config.js'
    )

    // Detect project type with deeper analysis
    const projectType = await this.detectProjectType(contents, packageJson, sourceFiles)

    // Extract scripts from package.json
    const scripts = packageJson?.scripts || {}

    // Step 10: Finalize analysis
    onProgress?.({
      current: 10,
      total: 10,
      message: "✅ Analysis complete!",
      percentage: 100
    })

    // Enhance packageJson with analysis data
    const enhancedPackageJson = packageJson ? {
      ...packageJson,
      sourceFiles,
      frameworkAnalysis,
      configFiles,
      projectStructure
    } : {
      sourceFiles,
      frameworkAnalysis,
      configFiles,
      projectStructure
    }

    return {
      id: repoData.id.toString(),
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      url: repoData.html_url,
      cloneUrl: repoData.clone_url,
      defaultBranch: repoData.default_branch,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at,
      stargazersCount: repoData.stargazers_count,
      forksCount: repoData.forks_count,
      watchersCount: repoData.watchers_count,
      openIssuesCount: repoData.open_issues_count,
      size: repoData.size,
      license: repoData.license?.name || null,
      topics: repoData.topics || [],
      languages: languages,
      primaryLanguage: Object.keys(languages)[0] || 'Unknown',
      projectType,
      hasPackageJson,
      hasReadme: !!readme,
      hasLicense,
      hasDockerfile,
      hasGitignore,
      hasEslint,
      hasPrettier,
      hasTypeScript,
      hasTailwind,
      hasTests,
      packageJson: enhancedPackageJson,
      scripts,
      stats,
      contributors: contributors.slice(0, 10).map(contributor => ({
        id: contributor.id.toString(),
        login: contributor.login,
        avatarUrl: contributor.avatar_url,
        contributions: contributor.contributions,
        htmlUrl: contributor.html_url,
      })),
      owner: {
        login: repoData.owner.login,
        avatarUrl: repoData.owner.avatar_url,
        htmlUrl: repoData.owner.html_url,
        type: repoData.owner.type,
      },
    }
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL')
    }

    const [, owner, repo] = match
    return { owner, repo: repo.replace(/\.git$/, '') }
  }
}

// Default service with server token (fallback)
export const githubService = new GitHubService(process.env.GITHUB_TOKEN)

// Create authenticated service with user's token
export function createAuthenticatedGitHubService(accessToken: string): GitHubService {
  return new GitHubService(accessToken)
}