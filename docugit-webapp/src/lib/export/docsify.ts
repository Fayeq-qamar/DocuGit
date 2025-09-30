import type { Project, Section } from '@/types'

export interface DocsifyConfig {
  name: string
  repo: string
  loadSidebar: boolean
  loadNavbar: boolean
  coverpage: boolean
  onlyCover: boolean
  auto2top: boolean
  maxLevel: number
  subMaxLevel: number
  search: {
    maxAge: number
    paths: string
    placeholder: string
    noData: string
  }
  plugins: string[]
  themeColor: string
}

export class DocsifyExporter {
  private project: Project

  constructor(project: Project) {
    this.project = project
  }

  generateConfig(): DocsifyConfig {
    return {
      name: this.project.repositoryUrl.split('/').pop() || 'Documentation',
      repo: this.project.repositoryUrl,
      loadSidebar: true,
      loadNavbar: true,
      coverpage: true,
      onlyCover: false,
      auto2top: true,
      maxLevel: 4,
      subMaxLevel: 2,
      search: {
        maxAge: 86400000,
        paths: 'auto',
        placeholder: 'Search...',
        noData: 'No Results!'
      },
      plugins: [],
      themeColor: this.project.theme?.colors?.primary || '#42b883'
    }
  }

  generateIndexHtml(): string {
    const config = this.generateConfig()

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${config.name}</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="description" content="Documentation for ${config.name}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
  <style>
    :root {
      --theme-color: ${config.themeColor};
    }
  </style>
</head>
<body>
  <div id="app">Loading...</div>
  <script>
    window.$docsify = ${JSON.stringify(config, null, 2)}
  </script>
  <!-- Docsify v4 -->
  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
  <!-- Search plugin -->
  <script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/search.min.js"></script>
  <!-- Copy to clipboard -->
  <script src="//cdn.jsdelivr.net/npm/docsify-copy-code/dist/docsify-copy-code.min.js"></script>
  <!-- Zoom image -->
  <script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/zoom-image.min.js"></script>
  <!-- Edit on GitHub -->
  <script src="//cdn.jsdelivr.net/npm/docsify-edit-on-github/index.js"></script>
</body>
</html>`
  }

  generateReadme(): string {
    const enabledSections = this.project.sections
      .filter(section => section.enabled)
      .sort((a, b) => a.order - b.order)

    let content = ''

    enabledSections.forEach(section => {
      if (section.type === 'header') {
        content += `# ${section.title}\n\n${section.content}\n\n`
      } else {
        content += `## ${section.title}\n\n${section.content}\n\n`
      }
    })

    return content
  }

  generateSidebar(): string {
    const enabledSections = this.project.sections
      .filter(section => section.enabled)
      .sort((a, b) => a.order - b.order)

    let sidebar = '* [Home](/)\n\n'

    enabledSections.forEach(section => {
      if (section.type !== 'header') {
        const slug = section.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        sidebar += `* [${section.title}](/#${slug})\n`
      }
    })

    return sidebar
  }

  generateNavbar(): string {
    return `* [GitHub](${this.project.repositoryUrl})
* [Documentation](/)`
  }

  generateCoverPage(): string {
    const headerSection = this.project.sections.find(s => s.type === 'header')
    const overviewSection = this.project.sections.find(s => s.type === 'overview')

    return `![logo](https://docsify.js.org/_media/icon.svg)

# ${headerSection?.title || 'Documentation'}

> ${overviewSection?.content || 'A magical documentation generator'}.

[GitHub](${this.project.repositoryUrl})
[Get Started](/#quick-start)`
  }

  exportAsZip(): {
    'index.html': string
    'README.md': string
    '_sidebar.md': string
    '_navbar.md': string
    '_coverpage.md': string
  } {
    return {
      'index.html': this.generateIndexHtml(),
      'README.md': this.generateReadme(),
      '_sidebar.md': this.generateSidebar(),
      '_navbar.md': this.generateNavbar(),
      '_coverpage.md': this.generateCoverPage()
    }
  }
}

export const createDocsifyExport = (project: Project) => {
  const exporter = new DocsifyExporter(project)
  return exporter.exportAsZip()
}