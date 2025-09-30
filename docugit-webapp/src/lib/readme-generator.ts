import { Repository } from '@/types'

export interface ReadmeTemplate {
  name: string
  sections: string[]
  theme: {
    primary: string
    accent: string
    gradient: string
  }
}

export interface GeneratedSection {
  type: string
  title: string
  content: string
  order: number
}

export class StylizedReadmeGenerator {
  private repository: Repository
  private template: ReadmeTemplate

  constructor(repository: Repository, template: ReadmeTemplate = this.getDefaultTemplate()) {
    this.repository = repository
    this.template = template
  }

  // Main generation method
  async generateStylizedReadme(): Promise<string> {
    const sections = await this.generateAllSections()
    return this.combineIntoFinalReadme(sections)
  }

  private getDefaultTemplate(): ReadmeTemplate {
    return {
      name: 'comprehensive',
      sections: [
        'header', 'hero', 'badges', 'toc', 'about', 'features',
        'installation', 'usage', 'api', 'structure',
        'contributing', 'stats', 'footer'
      ],
      theme: {
        primary: '#f093fb',
        accent: '#f5576c',
        gradient: 'linear-gradient(45deg, #f093fb, #f5576c)'
      }
    }
  }

  // Technology detection and badge generation
  private detectTechnologies(): string[] {
    const technologies = new Set<string>()

    // From languages
    Object.keys(this.repository.languages).forEach(lang => {
      technologies.add(lang.toLowerCase())
    })

    // From package.json dependencies
    if (this.repository.packageJson) {
      const deps = {
        ...this.repository.packageJson.dependencies,
        ...this.repository.packageJson.devDependencies
      }

      Object.keys(deps).forEach(dep => {
        const normalized = this.normalizeTechName(dep)
        if (normalized) technologies.add(normalized)
      })
    }

    // From file detection
    if (this.repository.hasTypeScript) technologies.add('typescript')
    if (this.repository.hasTailwind) technologies.add('tailwindcss')
    if (this.repository.hasEslint) technologies.add('eslint')
    if (this.repository.hasPrettier) technologies.add('prettier')
    if (this.repository.hasDockerfile) technologies.add('docker')

    return Array.from(technologies)
  }

  private normalizeTechName(dep: string): string | null {
    const techMap: Record<string, string> = {
      'react': 'react',
      'next': 'nextjs',
      'nextjs': 'nextjs',
      'vue': 'vue',
      'angular': 'angular',
      'typescript': 'typescript',
      'javascript': 'javascript',
      'node': 'nodejs',
      'nodejs': 'nodejs',
      'express': 'express',
      'fastify': 'fastify',
      'koa': 'koa',
      'nestjs': 'nestjs',
      'tailwindcss': 'tailwindcss',
      'sass': 'sass',
      'styled-components': 'styled-components',
      'material-ui': 'mui',
      '@mui/material': 'mui',
      'framer-motion': 'framer',
      'mongodb': 'mongodb',
      'mongoose': 'mongodb',
      'postgresql': 'postgresql',
      'mysql': 'mysql',
      'redis': 'redis',
      'firebase': 'firebase',
      'supabase': 'supabase',
      'prisma': 'prisma',
      'graphql': 'graphql',
      'apollo': 'apollo',
      'jest': 'jest',
      'cypress': 'cypress',
      'playwright': 'playwright',
      'webpack': 'webpack',
      'vite': 'vite',
      'rollup': 'rollup',
      'babel': 'babel',
      'eslint': 'eslint',
      'prettier': 'prettier',
      'husky': 'git',
      'lint-staged': 'git',
      'vercel': 'vercel',
      'netlify': 'netlify',
      'docker': 'docker',
      'kubernetes': 'kubernetes'
    }

    return techMap[dep.toLowerCase()] || null
  }

  private generateBadge(tech: string): string {
    const badges: Record<string, { label: string; color: string; logo: string; logoColor?: string }> = {
      javascript: { label: 'JavaScript', color: 'F7DF1E', logo: 'javascript', logoColor: 'black' },
      typescript: { label: 'TypeScript', color: '007ACC', logo: 'typescript', logoColor: 'white' },
      react: { label: 'React', color: '61DAFB', logo: 'react', logoColor: 'black' },
      nextjs: { label: 'Next.js', color: '000000', logo: 'next.js', logoColor: 'white' },
      vue: { label: 'Vue.js', color: '4FC08D', logo: 'vue.js', logoColor: 'white' },
      angular: { label: 'Angular', color: 'DD0031', logo: 'angular', logoColor: 'white' },
      nodejs: { label: 'Node.js', color: '339933', logo: 'node.js', logoColor: 'white' },
      express: { label: 'Express.js', color: '000000', logo: 'express', logoColor: 'white' },
      nestjs: { label: 'NestJS', color: 'E0234E', logo: 'nestjs', logoColor: 'white' },
      python: { label: 'Python', color: '3776AB', logo: 'python', logoColor: 'white' },
      tailwindcss: { label: 'Tailwind CSS', color: '06B6D4', logo: 'tailwindcss', logoColor: 'white' },
      sass: { label: 'Sass', color: 'CC6699', logo: 'sass', logoColor: 'white' },
      mongodb: { label: 'MongoDB', color: '47A248', logo: 'mongodb', logoColor: 'white' },
      postgresql: { label: 'PostgreSQL', color: '336791', logo: 'postgresql', logoColor: 'white' },
      mysql: { label: 'MySQL', color: '4479A1', logo: 'mysql', logoColor: 'white' },
      redis: { label: 'Redis', color: 'DC382D', logo: 'redis', logoColor: 'white' },
      firebase: { label: 'Firebase', color: 'FFCA28', logo: 'firebase', logoColor: 'black' },
      docker: { label: 'Docker', color: '2496ED', logo: 'docker', logoColor: 'white' },
      graphql: { label: 'GraphQL', color: 'E10098', logo: 'graphql', logoColor: 'white' },
      jest: { label: 'Jest', color: 'C21325', logo: 'jest', logoColor: 'white' },
      cypress: { label: 'Cypress', color: '17202C', logo: 'cypress', logoColor: 'white' },
      vercel: { label: 'Vercel', color: '000000', logo: 'vercel', logoColor: 'white' },
      git: { label: 'Git', color: 'F05032', logo: 'git', logoColor: 'white' },
      eslint: { label: 'ESLint', color: '4B32C3', logo: 'eslint', logoColor: 'white' },
      prettier: { label: 'Prettier', color: 'F7B93E', logo: 'prettier', logoColor: 'black' }
    }

    const badge = badges[tech] || { label: tech, color: '666666', logo: tech, logoColor: 'white' }
    const logoColor = badge.logoColor || 'white'

    return `![${badge.label}](https://img.shields.io/badge/${encodeURIComponent(badge.label)}-%23${badge.color}.svg?style=for-the-badge&logo=${badge.logo}&logoColor=${logoColor})`
  }

  // Section generators
  private async generateAllSections(): Promise<GeneratedSection[]> {
    const sections: GeneratedSection[] = []

    for (const sectionType of this.template.sections) {
      let section: GeneratedSection | null = null

      switch (sectionType) {
        case 'header':
          section = this.generateHeader()
          break
        case 'hero':
          section = this.generateHero()
          break
        case 'badges':
          section = this.generateBadges()
          break
        case 'toc':
          section = this.generateTableOfContents()
          break
        case 'about':
          section = this.generateAbout()
          break
        case 'features':
          section = this.generateFeatures()
          break
        case 'installation':
          section = this.generateInstallation()
          break
        case 'usage':
          section = this.generateUsage()
          break
        case 'api':
          section = this.generateAPI()
          break
        case 'structure':
          section = this.generateProjectStructure()
          break
        case 'roadmap':
          section = this.generateRoadmap()
          break
        case 'contributing':
          section = this.generateContributing()
          break
        case 'stats':
          section = this.generateStats()
          break
        case 'footer':
          section = this.generateFooter()
          break
      }

      if (section) {
        sections.push(section)
      }
    }

    return sections
  }

  private generateHeader(): GeneratedSection {
    const projectName = this.repository.name
    const description = this.repository.description || "An awesome project"

    const typingLines = [
      projectName,
      description,
      `Built with ${this.repository.primaryLanguage}`
    ]

    const content = `<!-- Ultra-Stylized Header -->
<h1 align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=32&duration=2000&pause=1000&color=F5576C&center=true&vCenter=true&width=600&lines=${encodeURIComponent(typingLines.join(';'))}" alt="Typing SVG" />
</h1>

<!-- Animated Banner -->
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12&height=200&section=header&text=${encodeURIComponent(projectName)}&fontSize=60&animation=fadeIn&fontAlignY=35" />
</div>

<!-- Quick Stats Row -->
<p align="center">
  <img src="https://img.shields.io/github/stars/${this.repository.fullName}?style=for-the-badge&logo=github&logoColor=white&label=STARS&color=FFD700" />
  <img src="https://img.shields.io/github/forks/${this.repository.fullName}?style=for-the-badge&logo=github&logoColor=white&label=FORKS&color=32CD32" />
  <img src="https://img.shields.io/github/issues/${this.repository.fullName}?style=for-the-badge&logo=github&logoColor=white&label=ISSUES&color=FF6B6B" />
  ${this.repository.license ? `<img src="https://img.shields.io/github/license/${this.repository.fullName}?style=for-the-badge&label=LICENSE&color=007EC6" />` : ''}
  <img src="https://img.shields.io/github/last-commit/${this.repository.fullName}?style=for-the-badge&label=LAST%20COMMIT&color=F0DB4F" />
</p>

<!-- Visitor Counter -->
<p align="center">
  <img src="https://komarev.com/ghpvc/?username=${this.repository.name}&style=for-the-badge&color=blueviolet" />
</p>`

    return {
      type: 'header',
      title: 'Header',
      content,
      order: 1
    }
  }

  private generateHero(): GeneratedSection {
    const content = `## 🚀 Welcome to ${this.repository.name}

<div align="center">

  ${this.repository.description ? `### ${this.repository.description}` : ''}

  <br>

  <!-- Quick Action Buttons -->
  <a href="${this.repository.url}">
    <img src="https://img.shields.io/badge/VIEW-REPOSITORY-success?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="${this.repository.url}/issues">
    <img src="https://img.shields.io/badge/REPORT-BUG-red?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="${this.repository.url}/issues">
    <img src="https://img.shields.io/badge/REQUEST-FEATURE-purple?style=for-the-badge&logo=github&logoColor=white" />
  </a>

</div>`

    return {
      type: 'hero',
      title: 'Hero',
      content,
      order: 2
    }
  }

  private generateBadges(): GeneratedSection {
    const technologies = this.detectTechnologies()
    const languageBadges = technologies
      .filter(tech => ['javascript', 'typescript', 'python', 'go', 'rust', 'java', 'c', 'cpp', 'csharp'].includes(tech))
      .map(tech => this.generateBadge(tech))

    const frameworkBadges = technologies
      .filter(tech => ['react', 'nextjs', 'vue', 'angular', 'express', 'nestjs', 'fastify'].includes(tech))
      .map(tech => this.generateBadge(tech))

    const databaseBadges = technologies
      .filter(tech => ['mongodb', 'postgresql', 'mysql', 'redis', 'firebase'].includes(tech))
      .map(tech => this.generateBadge(tech))

    const toolBadges = technologies
      .filter(tech => ['docker', 'git', 'eslint', 'prettier', 'jest', 'cypress'].includes(tech))
      .map(tech => this.generateBadge(tech))

    // Tech Stack Icons
    const techIcons = technologies.slice(0, 12).join(',')

    const content = `## 🛠️ Built With

<!-- Tech Stack Icons -->
<p align="center">
  <img src="https://skillicons.dev/icons?i=${techIcons}" />
</p>

${languageBadges.length > 0 ? `### 👾 Languages
${languageBadges.join('\n')}
` : ''}

${frameworkBadges.length > 0 ? `### 🎨 Frameworks & Libraries
${frameworkBadges.join('\n')}
` : ''}

${databaseBadges.length > 0 ? `### 💾 Databases
${databaseBadges.join('\n')}
` : ''}

${toolBadges.length > 0 ? `### 🔧 Tools & Services
${toolBadges.join('\n')}
` : ''}`

    return {
      type: 'badges',
      title: 'Tech Stack',
      content,
      order: 3
    }
  }

  private generateTableOfContents(): GeneratedSection {
    const packageManager = this.detectPackageManager()
    const installCommand = this.getInstallCommand(packageManager)
    const runCommand = this.getRunCommand(packageManager)
    const productionCommand = this.getProductionCommand(packageManager)

    const content = `## Build

<details>
<summary>🚀 Click to expand</summary>

### Prerequisites

${this.repository.hasPackageJson ? `- Node.js 18 or higher
- ${packageManager} 6 or higher` : '- Git for version control'}

### Install dependencies

\`\`\`bash
${installCommand}
\`\`\`

### Start development server

\`\`\`bash
${runCommand}
\`\`\`

### Production build

\`\`\`bash
${productionCommand}
\`\`\`

</details>`

    return {
      type: 'toc',
      title: 'Build',
      content,
      order: 4
    }
  }

  private generateAbout(): GeneratedSection {
    const content = `## 📖 About The Project

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <img src="https://img.icons8.com/fluency/96/000000/rocket.png" width="60" />
        <br><br>
        <strong>⚡ ${this.getProjectTypeFeature()}</strong>
        <br>
        <sub>${this.getProjectTypeDescription()}</sub>
      </td>
      <td align="center" width="33%">
        <img src="https://img.icons8.com/fluency/96/000000/code.png" width="60" />
        <br><br>
        <strong>🎯 ${this.repository.primaryLanguage}</strong>
        <br>
        <sub>Built with modern ${this.repository.primaryLanguage} technologies</sub>
      </td>
      <td align="center" width="33%">
        <img src="https://img.icons8.com/fluency/96/000000/github.png" width="60" />
        <br><br>
        <strong>🔒 Open Source</strong>
        <br>
        <sub>Community-driven development</sub>
      </td>
    </tr>
  </table>
</div>

${this.repository.description ? `

**${this.repository.description}**

` : ''}

### ✨ Key Highlights

- 🚀 **${this.getProjectTypeFeature()}** - ${this.getProjectTypeDescription()}
- 🎯 **${this.repository.primaryLanguage}** - Built with modern technologies
- 📦 **${Object.keys(this.repository.languages).length} Languages** - Multi-language support
- 👥 **${this.repository.contributors.length} Contributors** - Community-driven development
${this.repository.hasTests ? '- 🧪 **Tested** - Comprehensive test coverage' : ''}
${this.repository.hasDockerfile ? '- 🐋 **Containerized** - Docker support included' : ''}
${this.repository.hasTypeScript ? '- 💙 **TypeScript** - Type-safe development' : ''}`

    return {
      type: 'about',
      title: 'About The Project',
      content,
      order: 5
    }
  }

  private generateFeatures(): GeneratedSection {
    const features = this.generateFeaturesList()

    const featureRows = []
    for (let i = 0; i < features.length; i += 3) {
      const rowFeatures = features.slice(i, i + 3)
      const cells = rowFeatures.map(feature => `
      <td align="center" width="33%">
        <img src="${feature.icon}" width="60" height="60" alt="${feature.name}">
        <br><br>
        <strong>${feature.emoji} ${feature.name}</strong>
        <br>
        <sub>${feature.description}</sub>
      </td>`).join('')

      featureRows.push(`    <tr>${cells}
    </tr>`)
    }

    // Add code analysis section if we have detailed source file data
    const codeAnalysisSection = this.generateCodeAnalysisSection()

    const content = `## ✨ Features

<div align="center">
  <table>
${featureRows.join('\n')}
  </table>
</div>

${codeAnalysisSection}`

    return {
      type: 'features',
      title: 'Features',
      content,
      order: 6
    }
  }

  private generateInstallation(): GeneratedSection {
    const packageManager = this.detectPackageManager()
    const installCommand = this.getInstallCommand(packageManager)
    const runCommand = this.getRunCommand(packageManager)

    const content = `## Screenshots

Add screenshots of your project here to showcase its visual features and user interface.`

    return {
      type: 'installation',
      title: 'Getting Started',
      content,
      order: 7
    }
  }

  private generateUsage(): GeneratedSection {
    const commonScripts = this.getCommonScripts()

    const content = `## Usage

### Quick Start Example

\`\`\`${this.repository.primaryLanguage.toLowerCase()}
${this.generateUsageExample()}
\`\`\`

${commonScripts.length > 0 ? `### Available Scripts

${commonScripts.map(script => `**${script.name}**
\`\`\`bash
${script.command}
\`\`\`
${script.description}

`).join('')}` : ''}`

    return {
      type: 'usage',
      title: 'Usage',
      content,
      order: 8
    }
  }

  private generateAPI(): GeneratedSection {
    // Only generate API section if we have actual API endpoints or it's clearly an API project
    const hasAPIEndpoints = this.repository.packageJson?.sourceFiles?.apiEndpoints?.length > 0
    const isAPIProject = this.isAPIProject()

    if (!hasAPIEndpoints && !isAPIProject) {
      return {
        type: 'api',
        title: 'API Reference',
        content: '',
        order: 9
      }
    }

    const detectedEndpoints = this.repository.packageJson?.sourceFiles?.apiEndpoints || []

    let endpointsTable = ''
    if (detectedEndpoints.length > 0) {
      const endpointRows = detectedEndpoints.map(ep =>
        `| \`${ep.method}\` | \`${ep.path}\` | Auto-detected endpoint | ❓ |`
      ).join('\n')

      endpointsTable = `| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
${endpointRows}`
    } else {
      endpointsTable = `| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| \`GET\` | \`/api/health\` | Health check | ❌ |
| \`GET\` | \`/api/data\` | Get data | ❌ |
| \`POST\` | \`/api/data\` | Create data | ✅ |
| \`PUT\` | \`/api/data/:id\` | Update data | ✅ |
| \`DELETE\` | \`/api/data/:id\` | Delete data | ✅ |`
    }

    const content = `## 📚 API Reference

### 🔌 Endpoints

${endpointsTable}

### 📝 Authentication

\`\`\`javascript
// Example authentication
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();

// Use token in subsequent requests
const data = await fetch('/api/protected', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});
\`\`\`

### 🔄 Response Format

\`\`\`json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
\`\`\``

    return {
      type: 'api',
      title: 'API Reference',
      content,
      order: 9
    }
  }

  private generateProjectStructure(): GeneratedSection {
    const structure = this.generateFileTree()
    const projectStructure = this.repository.packageJson?.projectStructure

    let additionalInfo = ''
    if (projectStructure) {
      additionalInfo = `

### 📊 Structure Analysis

- **${projectStructure.totalDirectories}** directories
- **${projectStructure.totalFiles}** files
- **Source code organization**: ${projectStructure.hasSourceDir ? '✅ Organized' : '📁 Root level'}
- **Documentation**: ${projectStructure.hasDocsDir ? '✅ Dedicated docs folder' : '📝 Integrated'}
- **Testing**: ${projectStructure.hasTestsDir ? '✅ Dedicated test folder' : '🧪 Integrated'}`
    }

    const content = `## 🗂️ Project Structure

\`\`\`
${structure}
\`\`\`${additionalInfo}`

    return {
      type: 'structure',
      title: 'Project Structure',
      content,
      order: 10
    }
  }

  private generateRoadmap(): GeneratedSection {
    const content = `## 🛣️ Roadmap

<div align="center">

### Phase 1: Foundation 🏗️
![Progress](https://geps.dev/progress/100)
- ✅ Project setup and configuration
- ✅ Core functionality implementation
- ✅ Basic documentation
- ✅ Initial testing framework

### Phase 2: Enhancement 🚀
![Progress](https://geps.dev/progress/75)
- ✅ Advanced features
- ✅ Performance optimizations
- ⏳ Extended test coverage
- ⏳ User experience improvements

### Phase 3: Scale 📈
![Progress](https://geps.dev/progress/25)
- ⏳ Advanced integrations
- ⏳ Performance monitoring
- 📋 Enterprise features
- 📋 Advanced security

### Phase 4: Future 🔮
![Progress](https://geps.dev/progress/0)
- 📋 AI-powered features
- 📋 Mobile applications
- 📋 Advanced analytics
- 📋 Global scale deployment

</div>

---

See the [open issues](${this.repository.url}/issues) for a full list of proposed features and known issues.`

    return {
      type: 'roadmap',
      title: 'Roadmap',
      content,
      order: 11
    }
  }

  private generateContributing(): GeneratedSection {
    const content = `## 🤝 Contributing

<div align="center">
  <img src="https://contrib.rocks/image?repo=${this.repository.fullName}" alt="Contributors" />
</div>

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### 🚀 How to Contribute

1. 🍴 **Fork the Project**
2. 🌿 **Create your Feature Branch** (\`git checkout -b feature/AmazingFeature\`)
3. 💬 **Commit your Changes** (\`git commit -m 'Add some AmazingFeature'\`)
4. 📤 **Push to the Branch** (\`git push origin feature/AmazingFeature\`)
5. 🎉 **Open a Pull Request**

### 📝 Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

### 🐛 Report Issues

Found a bug? [Create an issue](${this.repository.url}/issues/new) and help us improve!

### 💡 Request Features

Have an idea? [Request a feature](${this.repository.url}/issues/new) and let's discuss it!`

    return {
      type: 'contributing',
      title: 'Contributing',
      content,
      order: 12
    }
  }

  private generateStats(): GeneratedSection {
    const content = `## 📊 GitHub Stats

<div align="center">
  <img height="180em" src="https://github-readme-stats.vercel.app/api/pin/?username=${this.repository.owner.login}&repo=${this.repository.name}&theme=radical&show_owner=true"/>
</div>

<div align="center">
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${this.repository.owner.login}&theme=radical" />
</div>

### 📈 Repository Statistics

<div align="center">

![Stars](https://img.shields.io/github/stars/${this.repository.fullName}?style=for-the-badge&color=FFD700)
![Forks](https://img.shields.io/github/forks/${this.repository.fullName}?style=for-the-badge&color=32CD32)
![Issues](https://img.shields.io/github/issues/${this.repository.fullName}?style=for-the-badge&color=FF6B6B)
![Pull Requests](https://img.shields.io/github/issues-pr/${this.repository.fullName}?style=for-the-badge&color=9932CC)
![Watchers](https://img.shields.io/github/watchers/${this.repository.fullName}?style=for-the-badge&color=FF69B4)
![Size](https://img.shields.io/github/repo-size/${this.repository.fullName}?style=for-the-badge&color=4169E1)

</div>

### 📊 Language Distribution

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${this.repository.owner.login}&layout=compact&theme=radical" />
</div>`

    return {
      type: 'stats',
      title: 'Statistics',
      content,
      order: 13
    }
  }

  private generateFooter(): GeneratedSection {
    const content = `## 📜 License

${this.repository.license ? `Distributed under the **${this.repository.license}** License. See \`LICENSE\` file for more information.` : 'This project is open source. Please check the repository for license information.'}

---

<div align="center">

### 💖 Support This Project

<a href="https://github.com/sponsors/${this.repository.owner.login}">
  <img src="https://img.shields.io/badge/GitHub%20Sponsors-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white" />
</a>

### 🌐 Connect With ${this.repository.owner.login}

<a href="${this.repository.owner.htmlUrl}">
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
</a>

<br><br>

**Made with ❤️ and ☕ by [${this.repository.owner.login}](${this.repository.owner.htmlUrl})**

<a href="#top">⬆️ Back to Top</a>

</div>

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12&height=100&section=footer" />
</div>`

    return {
      type: 'footer',
      title: 'Footer',
      content,
      order: 14
    }
  }

  private generateCodeAnalysisSection(): string {
    // Check if we have detailed source file data
    if (!this.repository.packageJson?.sourceFiles?.fileDetails) {
      return ''
    }

    const sourceFiles = this.repository.packageJson.sourceFiles
    const fileDetails = sourceFiles.fileDetails || []

    if (fileDetails.length === 0) {
      return ''
    }

    // Generate file analysis table
    const fileRows = fileDetails.slice(0, 10).map(file => `
| \`${file.name}\` | ${file.analysis.components || 0} | ${file.analysis.functions || 0} | ${file.analysis.isTest ? '✅' : '❌'} | ${(file.size / 1024).toFixed(1)}KB |`).join('')

    return `

### 📊 Code Analysis

<div align="center">

**${sourceFiles.totalFiles} Source Files** • **${sourceFiles.totalComponents} Components** • **${sourceFiles.totalFunctions} Functions**

</div>

<details>
<summary><b>📁 File Analysis Breakdown</b></summary>

| File | Components | Functions | Test File | Size |
|------|------------|-----------|-----------|------|${fileRows}

${sourceFiles.componentNames?.length > 0 ? `
**🧩 Key Components**: ${sourceFiles.componentNames.slice(0, 8).map(name => `\`${name}\``).join(', ')}
` : ''}

${sourceFiles.apiEndpoints?.length > 0 ? `
**🔌 API Endpoints**: ${sourceFiles.apiEndpoints.slice(0, 5).map(ep => `\`${ep.method} ${ep.path}\``).join(', ')}
` : ''}

**📊 File Types**: ${Object.entries(sourceFiles.sourceFileTypes || {}).map(([ext, count]) => `${ext} (${count})`).join(', ')}

</details>`
  }

  // Helper methods
  private getSectionTitle(section: string): string {
    const titles: Record<string, string> = {
      'header': 'Header',
      'hero': 'Welcome',
      'badges': 'Tech Stack',
      'toc': 'Table of Contents',
      'about': 'About The Project',
      'features': 'Features',
      'installation': 'Getting Started',
      'usage': 'Usage',
      'api': 'API Reference',
      'structure': 'Project Structure',
      'roadmap': 'Roadmap',
      'contributing': 'Contributing',
      'stats': 'Statistics',
      'footer': 'License'
    }
    return titles[section] || section
  }

  private getSectionEmoji(section: string): string {
    const emojis: Record<string, string> = {
      'header': '🎯',
      'hero': '🚀',
      'badges': '🛠️',
      'toc': '📑',
      'about': '📖',
      'features': '✨',
      'installation': '⚙️',
      'usage': '💻',
      'api': '📚',
      'structure': '🗂️',
      'roadmap': '🛣️',
      'contributing': '🤝',
      'stats': '📊',
      'footer': '📜'
    }
    return emojis[section] || '📄'
  }

  private getProjectTypeFeature(): string {
    switch (this.repository.projectType) {
      case 'nextjs': return 'Next.js App'
      case 'react': return 'React Application'
      case 'vue': return 'Vue.js Application'
      case 'angular': return 'Angular Application'
      case 'backend': return 'Backend Service'
      case 'mobile': return 'Mobile Application'
      case 'desktop': return 'Desktop Application'
      case 'python': return 'Python Project'
      case 'rust': return 'Rust Project'
      case 'go': return 'Go Project'
      case 'java': return 'Java Project'
      default: return 'Software Project'
    }
  }

  private getProjectTypeDescription(): string {
    switch (this.repository.projectType) {
      case 'nextjs': return 'Built with Next.js for optimal performance'
      case 'react': return 'Modern React application with latest features'
      case 'vue': return 'Vue.js application with reactive components'
      case 'angular': return 'Enterprise Angular application'
      case 'backend': return 'Scalable backend service architecture'
      case 'mobile': return 'Cross-platform mobile application'
      case 'desktop': return 'Native desktop application'
      case 'python': return 'Python-based solution'
      case 'rust': return 'High-performance Rust implementation'
      case 'go': return 'Efficient Go service'
      case 'java': return 'Enterprise Java application'
      default: return 'Well-architected software solution'
    }
  }

  private generateFeaturesList() {
    const features = []

    // Base features
    features.push({
      name: this.getProjectTypeFeature(),
      description: this.getProjectTypeDescription(),
      emoji: '⚡',
      icon: 'https://img.icons8.com/fluency/96/000000/rocket.png'
    })

    if (this.repository.hasTypeScript) {
      features.push({
        name: 'Type Safety',
        description: 'Full TypeScript support for better development',
        emoji: '💙',
        icon: 'https://img.icons8.com/fluency/96/000000/typescript.png'
      })
    }

    if (this.repository.hasTests) {
      features.push({
        name: 'Well Tested',
        description: 'Comprehensive test coverage',
        emoji: '🧪',
        icon: 'https://img.icons8.com/fluency/96/000000/test.png'
      })
    }

    if (this.repository.hasDockerfile) {
      features.push({
        name: 'Containerized',
        description: 'Docker support for easy deployment',
        emoji: '🐋',
        icon: 'https://img.icons8.com/fluency/96/000000/docker.png'
      })
    }

    if (this.repository.hasTailwind) {
      features.push({
        name: 'Modern Styling',
        description: 'Beautiful UI with Tailwind CSS',
        emoji: '🎨',
        icon: 'https://img.icons8.com/fluency/96/000000/css3.png'
      })
    }

    // Add more features based on detected technologies
    if (this.detectTechnologies().includes('graphql')) {
      features.push({
        name: 'GraphQL API',
        description: 'Efficient data fetching with GraphQL',
        emoji: '🔌',
        icon: 'https://img.icons8.com/fluency/96/000000/api.png'
      })
    }

    // Ensure we have at least 6 features
    while (features.length < 6) {
      const defaultFeatures = [
        {
          name: 'Open Source',
          description: 'Free and open source software',
          emoji: '🔓',
          icon: 'https://img.icons8.com/fluency/96/000000/github.png'
        },
        {
          name: 'Active Development',
          description: 'Continuously improved and maintained',
          emoji: '🔄',
          icon: 'https://img.icons8.com/fluency/96/000000/activity.png'
        },
        {
          name: 'Documentation',
          description: 'Well-documented codebase',
          emoji: '📚',
          icon: 'https://img.icons8.com/fluency/96/000000/book.png'
        }
      ]

      const featureToAdd = defaultFeatures[features.length - 3] || defaultFeatures[0]
      if (!features.some(f => f.name === featureToAdd.name)) {
        features.push(featureToAdd)
      } else {
        break
      }
    }

    return features.slice(0, 6)
  }

  private generatePrerequisites(): string {
    const prerequisites = []

    if (this.detectTechnologies().includes('mongodb')) {
      prerequisites.push('- **MongoDB** database')
    }
    if (this.detectTechnologies().includes('postgresql')) {
      prerequisites.push('- **PostgreSQL** database')
    }
    if (this.detectTechnologies().includes('redis')) {
      prerequisites.push('- **Redis** server')
    }
    if (this.repository.hasDockerfile) {
      prerequisites.push('- **Docker** (optional)')
    }

    return prerequisites.join('\n')
  }

  private detectPackageManager(): string {
    // Check for lock files to determine package manager
    if (this.repository.packageJson) {
      // Default to npm for now, could be enhanced to detect from files
      return 'npm'
    }
    return 'npm'
  }

  private getInstallCommand(packageManager: string): string {
    switch (packageManager) {
      case 'yarn': return 'yarn install'
      case 'pnpm': return 'pnpm install'
      default: return 'npm install'
    }
  }

  private getRunCommand(packageManager: string): string {
    const devScript = this.repository.scripts?.dev || this.repository.scripts?.start
    if (!devScript) return 'npm start'

    switch (packageManager) {
      case 'yarn': return 'yarn dev'
      case 'pnpm': return 'pnpm dev'
      default: return 'npm run dev'
    }
  }

  private getProductionCommand(packageManager: string): string {
    const buildScript = this.repository.scripts?.build
    if (!buildScript) return 'npm run build'

    switch (packageManager) {
      case 'yarn': return 'yarn build'
      case 'pnpm': return 'pnpm build'
      default: return 'npm run build'
    }
  }

  private getCommonScripts() {
    const scripts = this.repository.scripts || {}
    const commonScripts = []

    const scriptDescriptions: Record<string, string> = {
      'dev': 'Start development server',
      'start': 'Start production server',
      'build': 'Build for production',
      'test': 'Run test suite',
      'lint': 'Run linting',
      'type-check': 'Run type checking',
      'format': 'Format code'
    }

    Object.entries(scripts).forEach(([name, command]) => {
      if (scriptDescriptions[name]) {
        commonScripts.push({
          name,
          command: `npm run ${name}`,
          description: scriptDescriptions[name]
        })
      }
    })

    return commonScripts
  }

  private generateUsageExample(): string {
    const detectedComponents = this.repository.packageJson?.sourceFiles?.componentNames || []
    const hasRealComponents = detectedComponents.length > 0

    switch (this.repository.projectType) {
      case 'nextjs':
      case 'react':
        if (hasRealComponents) {
          const componentName = detectedComponents[0]
          return `import { ${componentName} } from './${this.repository.name}'

const App = () => {
  return (
    <div>
      <${componentName} />
    </div>
  )
}

export default App`
        }
        return `// Install dependencies first
npm install

// Start development server
npm run dev

// Open http://localhost:3000`

      case 'backend':
        return `// Install dependencies
npm install

// Start the server
npm start

// The server will be running on http://localhost:3000`

      case 'python':
        return `# Install dependencies
pip install -r requirements.txt

# Run the application
python main.py`

      case 'mobile':
        return `// For React Native or mobile projects
npx react-native run-android
# or
npx react-native run-ios`

      case 'desktop':
        return `// For desktop applications
npm install
npm start`

      default:
        // For general projects, show basic setup instead of fake imports
        return `// Clone and set up the project
git clone ${this.repository.cloneUrl}
cd ${this.repository.name}

// Follow project-specific setup instructions
# Check README or documentation for specific commands`
    }
  }

  private generateAdvancedExample(): string {
    switch (this.repository.projectType) {
      case 'nextjs':
        return `// Advanced Next.js configuration
const config = {
  api: {
    baseURL: process.env.API_URL,
    timeout: 5000
  },
  features: {
    authentication: true,
    analytics: true
  }
}

export default config`

      case 'backend':
        return `// Advanced configuration
const config = {
  database: {
    url: process.env.DATABASE_URL,
    options: {
      ssl: true,
      poolSize: 10
    }
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    expiresIn: '7d'
  }
}

module.exports = config`

      default:
        return `// Advanced configuration
const config = {
  environment: process.env.NODE_ENV,
  options: {
    debug: true,
    verbose: false
  }
}

export default config`
    }
  }

  private isAPIProject(): boolean {
    return this.repository.projectType === 'backend' ||
           this.repository.projectType === 'nextjs' ||
           Object.keys(this.repository.scripts).some(script =>
             script.includes('api') || script.includes('server')
           )
  }

  private generateFileTree(): string {
    const baseStructure = `📦 ${this.repository.name}
├── 📂 src/
│   ├── 📄 index.${this.getFileExtension()}
│   └── 📂 components/
├── 📋 package.json
├── 📖 README.md
└── 📜 ${this.repository.license ? 'LICENSE' : '.gitignore'}`

    // Customize based on project type
    switch (this.repository.projectType) {
      case 'nextjs':
        return `📦 ${this.repository.name}
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📄 layout.tsx
│   │   ├── 📄 page.tsx
│   │   └── 📂 api/
│   ├── 📂 components/
│   │   ├── 📂 ui/
│   │   └── 📂 layout/
│   ├── 📂 lib/
│   └── 📂 styles/
├── 📂 public/
├── 📋 package.json
├── ⚙️ next.config.js
${this.repository.hasTypeScript ? '├── ⚙️ tsconfig.json' : ''}
${this.repository.hasTailwind ? '├── 🎨 tailwind.config.js' : ''}
├── 📖 README.md
└── 📜 LICENSE`

      case 'react':
        return `📦 ${this.repository.name}
├── 📂 src/
│   ├── 📄 index.${this.getFileExtension()}
│   ├── 📄 App.${this.getFileExtension()}
│   ├── 📂 components/
│   ├── 📂 hooks/
│   ├── 📂 utils/
│   └── 📂 styles/
├── 📂 public/
├── 📋 package.json
${this.repository.hasTypeScript ? '├── ⚙️ tsconfig.json' : ''}
├── 📖 README.md
└── 📜 LICENSE`

      default:
        return baseStructure
    }
  }

  private getFileExtension(): string {
    if (this.repository.hasTypeScript) return 'ts'
    if (this.repository.primaryLanguage.toLowerCase() === 'python') return 'py'
    if (this.repository.primaryLanguage.toLowerCase() === 'rust') return 'rs'
    if (this.repository.primaryLanguage.toLowerCase() === 'go') return 'go'
    return 'js'
  }

  private combineIntoFinalReadme(sections: GeneratedSection[]): string {
    // Sort sections by order
    sections.sort((a, b) => a.order - b.order)

    // Filter out empty sections and update TOC accordingly
    const validSections = sections.filter(section => section.content.trim() !== '')

    // Keep the TOC content as generated by generateTableOfContents method

    // Combine all sections
    const readmeContent = validSections
      .map(section => section.content)
      .join('\n\n---\n\n')

    return readmeContent
  }
}

// Export the main generation function
export async function generateUltraStylizedReadme(
  repository: Repository,
  template?: ReadmeTemplate
): Promise<string> {
  const generator = new StylizedReadmeGenerator(repository, template)
  return await generator.generateStylizedReadme()
}

// Export template options
export const README_TEMPLATES: Record<string, ReadmeTemplate> = {
  minimal: {
    name: 'Minimal Clean',
    sections: ['header', 'badges', 'about', 'installation', 'usage', 'footer'],
    theme: {
      primary: '#000000',
      accent: '#0969da',
      gradient: 'linear-gradient(45deg, #000000, #0969da)'
    }
  },
  comprehensive: {
    name: 'Comprehensive Pro',
    sections: [
      'header', 'hero', 'badges', 'toc', 'about', 'features',
      'installation', 'usage', 'api', 'structure',
      'contributing', 'stats', 'footer'
    ],
    theme: {
      primary: '#f093fb',
      accent: '#f5576c',
      gradient: 'linear-gradient(45deg, #f093fb, #f5576c)'
    }
  },
  documentation: {
    name: 'Documentation Focus',
    sections: [
      'header', 'toc', 'about', 'installation', 'usage', 'api',
      'structure', 'contributing', 'footer'
    ],
    theme: {
      primary: '#3b82f6',
      accent: '#1e293b',
      gradient: 'linear-gradient(45deg, #3b82f6, #1e293b)'
    }
  },
  portfolio: {
    name: 'Portfolio Project',
    sections: [
      'hero', 'badges', 'features', 'installation', 'usage',
      'stats', 'footer'
    ],
    theme: {
      primary: '#a855f7',
      accent: '#18181b',
      gradient: 'linear-gradient(45deg, #a855f7, #18181b)'
    }
  }
}