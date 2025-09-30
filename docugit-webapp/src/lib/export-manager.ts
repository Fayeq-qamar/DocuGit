import { DocumentationSite } from './documentation-engine'

export interface ExportOptions {
  format: 'markdown' | 'html' | 'pdf' | 'zip'
  includeAssets: boolean
  theme?: string
}

export class ExportManager {
  async exportDocumentation(
    documentation: DocumentationSite,
    options: ExportOptions
  ): Promise<Blob> {
    switch (options.format) {
      case 'markdown':
        return this.exportAsMarkdown(documentation, options)
      case 'html':
        return this.exportAsHTML(documentation, options)
      case 'zip':
        return this.exportAsZip(documentation, options)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  private async exportAsMarkdown(
    documentation: DocumentationSite,
    options: ExportOptions
  ): Promise<Blob> {
    if (documentation.pages.length === 1) {
      // Single README export
      const content = documentation.pages[0].content
      return new Blob([content], { type: 'text/markdown' })
    } else {
      // Multi-page markdown export as zip
      return this.exportAsZip(documentation, { ...options, format: 'markdown' })
    }
  }

  private async exportAsHTML(
    documentation: DocumentationSite,
    options: ExportOptions
  ): Promise<Blob> {
    const htmlContent = this.generateHTMLSite(documentation, options)
    return new Blob([htmlContent], { type: 'text/html' })
  }

  private async exportAsZip(
    documentation: DocumentationSite,
    options: ExportOptions
  ): Promise<Blob> {
    // For now, return a text file with instructions to implement zip export
    const content = `# ${documentation.repository} Documentation Export

This feature requires JSZip library. To implement:

1. Install JSZip: npm install jszip
2. Implement zip generation functionality

For now, download individual pages or use HTML export.

## Pages Available:
${documentation.pages.map(page => `- ${page.title} (${page.path})`).join('\n')}

Generated: ${new Date(documentation.generatedAt).toLocaleString()}
`

    return new Blob([content], { type: 'text/plain' })
  }

  private generateHTMLSite(
    documentation: DocumentationSite,
    options: ExportOptions
  ): string {
    const styles = this.generateStyles(documentation.config.theme)
    const scripts = this.generateScripts()

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentation.repository} Documentation</title>
    <style>${styles}</style>
</head>
<body>
    <div class="documentation-site">
        <header class="doc-header">
            <h1>📚 ${documentation.repository}</h1>
            <div class="meta">
                <span>Generated ${new Date(documentation.generatedAt).toLocaleDateString()}</span>
                <span class="badge">🤖 AI Generated</span>
            </div>
        </header>

        <div class="doc-layout">
            <aside class="doc-sidebar">
                <nav>
                    <h2>Documentation</h2>
                    <ul>
                        ${documentation.navigation.map(item =>
                          `<li><a href="#${item.path}" data-page="${item.path}">${item.title}</a></li>`
                        ).join('')}
                    </ul>
                </nav>
            </aside>

            <main class="doc-content">
                ${documentation.pages.map(page => `
                    <div class="doc-page" data-path="${page.path}" ${page.path === documentation.pages[0].path ? 'style="display: block;"' : 'style="display: none;"'}>
                        ${this.convertMarkdownToHTML(page.content, documentation.config.theme)}
                    </div>
                `).join('')}
            </main>
        </div>
    </div>

    <script>${scripts}</script>
</body>
</html>`
  }

  private generateIndexHTML(documentation: DocumentationSite): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentation.repository} Documentation</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>📚 ${documentation.repository} Documentation</h1>
            <p>Generated on ${new Date(documentation.generatedAt).toLocaleDateString()}</p>
        </header>

        <nav>
            <h2>Documentation Pages</h2>
            <ul>
                ${documentation.pages.map(page =>
                  `<li><a href="${page.path.replace('.md', '.html')}">${page.title}</a></li>`
                ).join('')}
            </ul>
        </nav>

        <footer>
            <p>Generated with ❤️ by <a href="https://docugit.com">DocuGit</a></p>
        </footer>
    </div>
    <script src="assets/app.js"></script>
</body>
</html>`
  }

  private convertMarkdownToHTML(markdown: string, theme: string): string {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/, '<p>$1</p>')
  }

  private generateStyles(theme: string): string {
    const baseStyles = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; }
      .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
      .documentation-site { min-height: 100vh; }
      .doc-header { background: #f8f9fa; padding: 20px; border-bottom: 1px solid #e9ecef; }
      .doc-header h1 { font-size: 2rem; margin-bottom: 10px; }
      .doc-layout { display: flex; min-height: calc(100vh - 120px); }
      .doc-sidebar { width: 250px; background: #f8f9fa; padding: 20px; border-right: 1px solid #e9ecef; }
      .doc-content { flex: 1; padding: 40px; }
      .doc-page { display: none; }
      .doc-page.active { display: block; }
      h1, h2, h3 { margin-bottom: 20px; }
      p { margin-bottom: 16px; }
      code { background: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
      pre { background: #f8f9fa; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; }
      .badge { background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
      nav ul { list-style: none; }
      nav li { margin-bottom: 8px; }
      nav a { text-decoration: none; color: #495057; padding: 8px; display: block; border-radius: 4px; }
      nav a:hover, nav a.active { background: #e9ecef; }
    `

    const themeStyles = {
      github: `
        .doc-header { background: #24292e; color: white; }
        .doc-sidebar { background: #f6f8fa; }
        nav a.active { background: #0366d6; color: white; }
      `,
      dark: `
        body { background: #1a1a1a; color: #e1e1e1; }
        .doc-header { background: #2d2d2d; }
        .doc-sidebar { background: #2d2d2d; }
        .doc-content { background: #1a1a1a; }
      `,
      gitbook: `
        .doc-sidebar { background: #fafbfc; border-right: 1px solid #e1e8ed; }
        nav a.active { background: #0084ff; color: white; }
      `,
      minimal: `
        .doc-header { background: white; border-bottom: 1px solid #eee; }
        .doc-sidebar { background: white; }
      `
    }

    return baseStyles + (themeStyles[theme as keyof typeof themeStyles] || themeStyles.github)
  }

  private generateScripts(): string {
    return `
      // Simple navigation for single-page HTML
      document.addEventListener('DOMContentLoaded', function() {
        const navLinks = document.querySelectorAll('[data-page]');
        const pages = document.querySelectorAll('.doc-page');

        navLinks.forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');

            // Hide all pages
            pages.forEach(page => page.style.display = 'none');

            // Show target page
            const target = document.querySelector(\`[data-path="\${targetPage}"]\`);
            if (target) target.style.display = 'block';

            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
          });
        });
      });
    `
  }

  async downloadFile(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const exportManager = new ExportManager()