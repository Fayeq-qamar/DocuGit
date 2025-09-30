import { Repository } from '@/types'
import { createAIService } from './ai-service'

export interface DocumentationConfig {
  mode: 'readme' | 'full-site'
  theme: 'github' | 'gitbook' | 'dark' | 'minimal'
  includeApi: boolean
  includeContributing: boolean
  includeChangelog: boolean
  includeExamples: boolean
  realTimeUpdates?: boolean
}

export interface DocumentationPage {
  path: string
  title: string
  content: string
  type: 'markdown' | 'html'
  order: number
}

export interface DocumentationSite {
  config: DocumentationConfig
  pages: DocumentationPage[]
  navigation: NavigationItem[]
  assets: string[]
  generatedAt: string
  repository: string
}

export interface NavigationItem {
  title: string
  path: string
  children?: NavigationItem[]
}

interface ProgressCallback {
  (progress: {
    current: number
    total: number
    message: string
    percentage: number
    page?: string
  }): void
}

export class DocumentationEngine {
  private aiService = createAIService()

  async generateDocumentation(
    repository: Repository,
    config: DocumentationConfig,
    onProgress?: ProgressCallback
  ): Promise<DocumentationSite> {
    const totalSteps = config.mode === 'readme' ? 3 : 8
    let currentStep = 0

    const updateProgress = (message: string, page?: string) => {
      currentStep++
      onProgress?.({
        current: currentStep,
        total: totalSteps,
        message,
        percentage: Math.round((currentStep / totalSteps) * 100),
        page
      })
    }

    if (config.mode === 'readme') {
      return this.generateReadmeOnly(repository, config, updateProgress)
    } else {
      return this.generateFullSite(repository, config, updateProgress)
    }
  }

  private async generateReadmeOnly(
    repository: Repository,
    config: DocumentationConfig,
    updateProgress: (message: string, page?: string) => void
  ): Promise<DocumentationSite> {
    updateProgress('🔍 Analyzing repository structure...')

    updateProgress('📝 Generating README content...', 'README.md')
    const readmeContent = await this.aiService.generateDocumentation(repository, {
      type: 'readme',
      style: 'comprehensive'
    })

    updateProgress('✅ Documentation complete!')

    return {
      config,
      pages: [{
        path: '/README.md',
        title: 'README',
        content: readmeContent,
        type: 'markdown',
        order: 1
      }],
      navigation: [{ title: 'README', path: '/README.md' }],
      assets: [],
      generatedAt: new Date().toISOString(),
      repository: `${repository.owner}/${repository.name}`
    }
  }

  private async generateFullSite(
    repository: Repository,
    config: DocumentationConfig,
    updateProgress: (message: string, page?: string) => void
  ): Promise<DocumentationSite> {
    const pages: DocumentationPage[] = []
    const navigation: NavigationItem[] = []

    // 1. Home/README
    updateProgress('📋 Generating homepage...', 'README.md')
    const readme = await this.generateHomePage(repository)
    pages.push({
      path: '/README.md',
      title: 'Home',
      content: readme,
      type: 'markdown',
      order: 1
    })
    navigation.push({ title: 'Home', path: '/README.md' })

    // 2. Getting Started
    updateProgress('🚀 Creating getting started guide...', 'getting-started.md')
    const gettingStarted = await this.generateGettingStarted(repository)
    pages.push({
      path: '/getting-started.md',
      title: 'Getting Started',
      content: gettingStarted,
      type: 'markdown',
      order: 2
    })
    navigation.push({ title: 'Getting Started', path: '/getting-started.md' })

    // 3. API Documentation (if enabled)
    if (config.includeApi) {
      updateProgress('📚 Generating API documentation...', 'api.md')
      const apiDocs = await this.generateApiDocs(repository)
      pages.push({
        path: '/api.md',
        title: 'API Reference',
        content: apiDocs,
        type: 'markdown',
        order: 3
      })
      navigation.push({ title: 'API Reference', path: '/api.md' })
    }

    // 4. Examples (if enabled)
    if (config.includeExamples) {
      updateProgress('💡 Creating examples...', 'examples.md')
      const examples = await this.generateExamples(repository)
      pages.push({
        path: '/examples.md',
        title: 'Examples',
        content: examples,
        type: 'markdown',
        order: 4
      })
      navigation.push({ title: 'Examples', path: '/examples.md' })
    }

    // 5. Contributing (if enabled)
    if (config.includeContributing) {
      updateProgress('🤝 Generating contributing guide...', 'contributing.md')
      const contributing = await this.generateContributing(repository)
      pages.push({
        path: '/contributing.md',
        title: 'Contributing',
        content: contributing,
        type: 'markdown',
        order: 5
      })
      navigation.push({ title: 'Contributing', path: '/contributing.md' })
    }

    // 6. Changelog (if enabled)
    if (config.includeChangelog) {
      updateProgress('📝 Creating changelog...', 'changelog.md')
      const changelog = await this.generateChangelog(repository)
      pages.push({
        path: '/changelog.md',
        title: 'Changelog',
        content: changelog,
        type: 'markdown',
        order: 6
      })
      navigation.push({ title: 'Changelog', path: '/changelog.md' })
    }

    updateProgress('🎨 Applying theme and finalizing...')

    return {
      config,
      pages,
      navigation,
      assets: this.generateAssets(config.theme),
      generatedAt: new Date().toISOString(),
      repository: `${repository.owner}/${repository.name}`
    }
  }

  private async generateHomePage(repository: Repository): Promise<string> {
    return this.aiService.generateDocumentation(repository, {
      type: 'readme',
      style: 'comprehensive'
    })
  }

  private async generateGettingStarted(repository: Repository): Promise<string> {
    const prompt = this.buildPrompt(repository, {
      type: 'getting-started',
      focus: 'installation and quick setup'
    })

    const response = await this.aiService.generateDocumentation(repository, {
      type: 'user-guide',
      style: 'comprehensive'
    })

    return response
  }

  private async generateApiDocs(repository: Repository): Promise<string> {
    // Analyze code structure for API endpoints, classes, functions
    const hasApi = this.detectApiStructure(repository)

    if (!hasApi) {
      return '# API Reference\n\nNo API endpoints detected in this repository.'
    }

    return this.aiService.generateDocumentation(repository, {
      type: 'api-docs',
      style: 'comprehensive'
    })
  }

  private async generateExamples(repository: Repository): Promise<string> {
    const exampleFiles = repository.files?.filter(f =>
      f.name.toLowerCase().includes('example') ||
      f.name.toLowerCase().includes('demo') ||
      f.path.includes('/examples/') ||
      f.path.includes('/demos/')
    ) || []

    const prompt = `Generate comprehensive examples documentation for ${repository.name}.

Repository: ${repository.name}
Description: ${repository.description}
Main Language: ${Object.keys(repository.languages || {})[0]}
Example Files Found: ${exampleFiles.map(f => f.name).join(', ')}

Include:
- Basic usage examples
- Advanced use cases
- Code snippets with explanations
- Common patterns and best practices
- Integration examples

Format as clean Markdown with syntax highlighting.`

    const response = await this.aiService.generateDocumentation(repository, {
      type: 'user-guide',
      style: 'comprehensive'
    })

    return response
  }

  private async generateContributing(repository: Repository): Promise<string> {
    const prompt = `Generate a comprehensive contributing guide for ${repository.name}.

Repository: ${repository.name}
Languages: ${Object.keys(repository.languages || {}).join(', ')}

Include:
- How to set up development environment
- Code style guidelines
- Pull request process
- Issue reporting guidelines
- Testing requirements
- Community guidelines

Format as clean Markdown.`

    const response = await this.aiService.generateDocumentation(repository, {
      type: 'user-guide',
      style: 'documentation'
    })

    return response
  }

  private async generateChangelog(repository: Repository): Promise<string> {
    // In a real implementation, this would analyze git history
    return `# Changelog

All notable changes to ${repository.name} will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial documentation generation

### Changed
- Improved documentation structure

### Fixed
- Documentation formatting issues

---

*This changelog is automatically maintained. For the complete history, see [Git commits](https://github.com/${repository.owner}/${repository.name}/commits).*`
  }

  private detectApiStructure(repository: Repository): boolean {
    // Simple heuristic to detect if repository has API endpoints
    const apiIndicators = [
      'api', 'endpoint', 'route', 'controller', 'handler',
      'express', 'fastify', 'koa', 'nest', 'django', 'flask'
    ]

    const files = repository.files || []
    return files.some(file =>
      apiIndicators.some(indicator =>
        file.name.toLowerCase().includes(indicator) ||
        file.path.toLowerCase().includes(indicator)
      )
    )
  }

  private generateAssets(theme: string): string[] {
    const baseAssets = [
      '/assets/style.css',
      '/assets/app.js'
    ]

    switch (theme) {
      case 'github':
        return [...baseAssets, '/assets/themes/github.css']
      case 'gitbook':
        return [...baseAssets, '/assets/themes/gitbook.css']
      case 'dark':
        return [...baseAssets, '/assets/themes/dark.css']
      default:
        return [...baseAssets, '/assets/themes/minimal.css']
    }
  }

  private buildPrompt(repository: any, options: any): string {
    return `Generate ${options.type} documentation focusing on ${options.focus} for ${repository.name}`
  }
}

export const documentationEngine = new DocumentationEngine()