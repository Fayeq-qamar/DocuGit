"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Eye, Settings, FileText, Globe, Code2, Save, Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DocumentationSection {
  id: string
  title: string
  content: string
  enabled: boolean
  type: string
}

interface RepositoryData {
  owner: string
  repo: string
  fullName: string
  description: string
  language: string
  topics: string[]
  stars: number
  forks: number
  analysisType: 'readme' | 'docs'
  files: any[]
}

export default function EditorPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<'edit' | 'preview' | 'split'>('split')
  const [repositoryData, setRepositoryData] = useState<RepositoryData | null>(null)
  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")

  const [sections, setSections] = useState<DocumentationSection[]>([])

  // Generate repository-specific content
  const generateRepositoryContent = (repoData: RepositoryData): DocumentationSection[] => {
    const isFramework = repoData.language === 'TypeScript' || repoData.language === 'JavaScript'
    const hasReact = repoData.files?.some(f => f.path.includes('react') || f.path.includes('jsx') || f.path.includes('tsx'))
    const hasNext = repoData.files?.some(f => f.path.includes('next') || f.path.includes('next.config'))
    const hasPackageJson = repoData.files?.some(f => f.path === 'package.json')
    const hasDocker = repoData.files?.some(f => f.path.includes('Dockerfile') || f.path.includes('docker'))
    const hasPython = repoData.language === 'Python'
    const hasGo = repoData.language === 'Go'
    const hasRust = repoData.language === 'Rust'

    const sections: DocumentationSection[] = []

    // Header Section with Badges
    sections.push({
      id: '1',
      title: 'Header',
      content: `<div align="center">

# ${repoData.repo}

<p align="center">
  <img src="https://img.shields.io/github/stars/${repoData.fullName}?style=for-the-badge&logo=github" alt="GitHub stars" />
  <img src="https://img.shields.io/github/forks/${repoData.fullName}?style=for-the-badge&logo=github" alt="GitHub forks" />
  <img src="https://img.shields.io/github/license/${repoData.fullName}?style=for-the-badge" alt="License" />
  ${repoData.language ? `<img src="https://img.shields.io/badge/${repoData.language}-blue?style=for-the-badge&logo=${repoData.language.toLowerCase()}" alt="${repoData.language}" />` : ''}
</p>

<h3 align="center">${repoData.description || 'A powerful and modern application'}</h3>

<p align="center">
  <a href="#-features"><strong>Features</strong></a> ·
  <a href="#-installation"><strong>Installation</strong></a> ·
  <a href="#-usage"><strong>Usage</strong></a> ·
  <a href="#-contributing"><strong>Contributing</strong></a>
</p>

</div>

---`,
      enabled: true,
      type: 'header'
    })

    // Overview Section
    sections.push({
      id: '2',
      title: 'Overview',
      content: `## 📋 Overview

${repoData.description || 'This project provides a comprehensive solution for modern development needs.'}

${repoData.topics && repoData.topics.length > 0 ? `
### 🏷️ Technologies
${repoData.topics.map(topic => `\`${topic}\``).join(' • ')}
` : ''}

### 📊 Project Stats
- ⭐ **${repoData.stars}** stars
- 🍴 **${repoData.forks}** forks
- 🔧 Primary language: **${repoData.language}**

### ✨ Key Features

- 🚀 **High Performance** - Optimized for speed and efficiency
- 📱 **Responsive Design** - Works seamlessly across all devices
- 🔒 **Secure** - Built with security best practices
- 🛠️ **Extensible** - Easy to customize and extend
- 📚 **Well Documented** - Comprehensive documentation and examples`,
      enabled: true,
      type: 'overview'
    })

    // Installation Section
    const installContent = hasPackageJson
      ? `## 🚀 Installation

### Prerequisites
- ${isFramework ? 'Node.js 18.0 or higher' : hasPython ? 'Python 3.8+' : hasGo ? 'Go 1.19+' : hasRust ? 'Rust 1.60+' : 'Latest runtime environment'}
- ${hasPackageJson ? 'npm or yarn package manager' : 'Package manager for your platform'}

### Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/${repoData.fullName}.git
   cd ${repoData.repo}
   \`\`\`

2. **Install dependencies**
   ${hasPackageJson ? `\`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`` : hasPython ? `\`\`\`bash
   pip install -r requirements.txt
   \`\`\`` : hasGo ? `\`\`\`bash
   go mod download
   \`\`\`` : hasRust ? `\`\`\`bash
   cargo build
   \`\`\`` : `\`\`\`bash
   # Install dependencies based on your setup
   \`\`\``}

3. **Start the development server**
   ${hasNext ? `\`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`` : hasPackageJson ? `\`\`\`bash
   npm start
   # or
   yarn start
   \`\`\`` : hasPython ? `\`\`\`bash
   python main.py
   \`\`\`` : hasGo ? `\`\`\`bash
   go run main.go
   \`\`\`` : hasRust ? `\`\`\`bash
   cargo run
   \`\`\`` : `\`\`\`bash
   # Start the application
   \`\`\``}

4. **Open your browser**
   Navigate to \`http://localhost:${hasNext ? '3000' : '8080'}\` to see the application.

${hasDocker ? `
### 🐳 Docker Installation

\`\`\`bash
# Build the Docker image
docker build -t ${repoData.repo} .

# Run the container
docker run -p ${hasNext ? '3000' : '8080'}:${hasNext ? '3000' : '8080'} ${repoData.repo}
\`\`\`
` : ''}`
      : `## 🚀 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/${repoData.fullName}.git
   cd ${repoData.repo}
   \`\`\`

2. **Follow the setup instructions**
   Check the project files for specific setup requirements.`

    sections.push({
      id: '3',
      title: 'Installation',
      content: installContent,
      enabled: true,
      type: 'installation'
    })

    // Usage Section
    sections.push({
      id: '4',
      title: 'Usage',
      content: `## 💻 Usage

### Basic Example

${hasReact ? `\`\`\`jsx
import { Component } from './${repoData.repo}'

function App() {
  return (
    <div className="app">
      <Component />
    </div>
  )
}

export default App
\`\`\`` : hasPackageJson ? `\`\`\`javascript
const ${repoData.repo} = require('./${repoData.repo}')

// Initialize the application
const app = new ${repoData.repo}()
app.start()
\`\`\`` : hasPython ? `\`\`\`python
from ${repoData.repo} import main

# Run the application
if __name__ == "__main__":
    main()
\`\`\`` : hasGo ? `\`\`\`go
package main

import "${repoData.fullName}"

func main() {
    // Your code here
}
\`\`\`` : hasRust ? `\`\`\`rust
use ${repoData.repo};

fn main() {
    // Your code here
}
\`\`\`` : `\`\`\`
# Basic usage example
${repoData.repo} --help
\`\`\``}

### Configuration

${hasPackageJson ? `Create a \`.env\` file in the root directory:

\`\`\`env
# Environment variables
NODE_ENV=development
PORT=${hasNext ? '3000' : '8080'}
API_URL=http://localhost:8080/api
\`\`\`` : `Check the configuration files for available options.`}

### Advanced Usage

For more advanced use cases, please refer to the [documentation](./docs) or check the [examples](./examples) directory.`,
      enabled: true,
      type: 'usage'
    })

    // API/Features Section (if applicable)
    if (hasPackageJson || hasReact) {
      sections.push({
        id: '5',
        title: 'API Reference',
        content: `## 📖 API Reference

### Core Methods

${hasReact ? `#### Components

\`\`\`jsx
import { PrimaryButton, SecondaryButton } from '${repoData.repo}'

<PrimaryButton onClick={handleClick}>
  Click me
</PrimaryButton>
\`\`\`

#### Hooks

\`\`\`jsx
import { useData } from '${repoData.repo}'

const { data, loading, error } = useData(url)
\`\`\`` : `#### Main Functions

\`\`\`javascript
// Initialize
const instance = new ${repoData.repo}(options)

// Methods
instance.method(params)
instance.asyncMethod().then(result => {
  console.log(result)
})
\`\`\``}

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`option1\` | \`string\` | \`"default"\` | Configuration option description |
| \`option2\` | \`boolean\` | \`true\` | Another configuration option |
| \`option3\` | \`number\` | \`100\` | Numeric configuration option |

For complete API documentation, visit our [API docs](./docs/api.md).`,
        enabled: true,
        type: 'api'
      })
    }

    // Contributing Section
    sections.push({
      id: '6',
      title: 'Contributing',
      content: `## 🤝 Contributing

We welcome contributions from the community! Here's how you can help make **${repoData.repo}** even better.

### 🔧 Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/${repoData.repo}.git
   cd ${repoData.repo}
   \`\`\`

3. **Create a new branch** for your feature:
   \`\`\`bash
   git checkout -b feature/amazing-feature
   \`\`\`

4. **Install dependencies** and start developing:
   ${hasPackageJson ? `\`\`\`bash
   npm install
   npm run dev
   \`\`\`` : `\`\`\`bash
   # Follow installation steps above
   \`\`\``}

### 📝 Making Changes

- Write clear, readable code with appropriate comments
- Follow the existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

### 🚀 Submitting Changes

1. **Commit your changes** with a descriptive message:
   \`\`\`bash
   git commit -m "✨ Add amazing new feature"
   \`\`\`

2. **Push to your fork**:
   \`\`\`bash
   git push origin feature/amazing-feature
   \`\`\`

3. **Create a Pull Request** on GitHub with:
   - Clear description of changes
   - Screenshots (if applicable)
   - Testing instructions

### 🐛 Reporting Issues

Found a bug? Please [open an issue](https://github.com/${repoData.fullName}/issues) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details

---

💝 **Thank you for contributing to ${repoData.repo}!**`,
      enabled: true,
      type: 'contributing'
    })

    // License and Footer
    sections.push({
      id: '7',
      title: 'License & Credits',
      content: `## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all our [contributors](https://github.com/${repoData.fullName}/contributors)
- Built with ❤️ by the **${repoData.owner}** team
- Special thanks to the open source community

## 📞 Support

- 📧 Email: [support@${repoData.owner}.com](mailto:support@${repoData.owner}.com)
- 💬 Discussions: [GitHub Discussions](https://github.com/${repoData.fullName}/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/${repoData.fullName}/issues)
- 📖 Documentation: [Wiki](https://github.com/${repoData.fullName}/wiki)

---

<div align="center">

**[⬆ Back to top](#${repoData.repo.toLowerCase()})**

Made with ❤️ by [${repoData.owner}](https://github.com/${repoData.owner})

</div>`,
      enabled: true,
      type: 'footer'
    })

    return sections
  }

  // Load repository data and generate content on mount
  useEffect(() => {
    const storedData = localStorage.getItem('repositoryData')
    console.log('🚨 RAW LOCALSTORAGE DATA:', storedData)

    if (storedData) {
      try {
        const repoData: any = JSON.parse(storedData)
        console.log('🚨 PARSED DATA:', repoData)

        setRepositoryData(repoData)
        setProjectTitle(repoData.repo)
        setProjectDescription(repoData.description || 'A modern application built with cutting-edge technologies')

        // Check if we have AI-generated content
        console.log('🔍 Editor received data:', {
          aiGenerated: repoData.aiGenerated,
          hasSections: !!repoData.generatedSections,
          sectionsCount: repoData.generatedSections?.length,
          firstSectionPreview: repoData.generatedSections?.[0]?.content?.substring(0, 100)
        })

        if (repoData.aiGenerated && repoData.generatedSections) {
          // Use AI-generated sections
          console.log('✅ Using AI-generated sections')
          setSections(repoData.generatedSections)
        } else {
          // Fallback to template-based generation
          console.log('❌ Falling back to templates, reason:', {
            aiGenerated: repoData.aiGenerated,
            hasSections: !!repoData.generatedSections
          })
          const generatedSections = generateRepositoryContent(repoData)
          setSections(generatedSections)
        }

        // Don't clear localStorage immediately - keep it for potential re-renders
        // localStorage.removeItem('repositoryData')
      } catch (error) {
        console.error('Error parsing repository data:', error)
        // Fallback to default content if parsing fails
        setProjectTitle('Documentation Project')
        setProjectDescription('Professional documentation made easy')
        loadDefaultSections()
      }
    } else {
      console.log('❌ NO LOCALSTORAGE DATA FOUND')
      // Default content when no repository data is available
      setProjectTitle('Documentation Project')
      setProjectDescription('Professional documentation made easy')
      loadDefaultSections()
    }
  }, [])

  const loadDefaultSections = () => {
    setSections([
      {
        id: '1',
        title: 'Getting Started',
        content: `## Getting Started

Welcome to your documentation editor! This is where you can create beautiful, professional documentation for your projects.

### Quick Tips

- Use the **split view** to see your changes in real-time
- **Toggle sections** on and off using the sidebar
- **Export to README.md** when you're ready
- **Add custom sections** with the + button

Start editing the content below to create your perfect documentation!`,
        enabled: true,
        type: 'getting-started'
      }
    ])
  }

  const toggleSection = (id: string) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, enabled: !section.enabled } : section
    ))
  }

  const updateSection = (id: string, field: 'title' | 'content', value: string) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    ))
  }

  const addSection = () => {
    const newSection: DocumentationSection = {
      id: Date.now().toString(),
      title: 'New Section',
      content: '## New Section\n\nAdd your content here...',
      enabled: true,
      type: 'custom'
    }
    setSections([...sections, newSection])
  }

  const deleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id))
  }

  const renderMarkdown = (content: string) => {
    // Enhanced rendering for ultra-stylized content - preserve HTML and process markdown
    if (content.includes('<')) {
      // Content already contains HTML, return as-is
      return content
    }

    // Process markdown for content without HTML
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg mt-4 mb-4 overflow-x-auto"><code class="text-sm">$2</code></pre>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l|p])(.+$)/gim, '<p class="mb-4">$1</p>')
  }

  const generateMarkdown = () => {
    let markdown = `# ${projectTitle}\n\n${projectDescription}\n\n`

    sections.filter(section => section.enabled).forEach(section => {
      markdown += section.content + '\n\n'
    })

    return markdown
  }

  const exportReadme = () => {
    const markdown = generateMarkdown()
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'README.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="btn-hover-bounce shadow-hover"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Documentation Editor</h1>
              <p className="text-sm text-gray-600">Edit and preview your documentation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
              <TabsList>
                <TabsTrigger value="edit" className="btn-hover-scale shadow-hover">
                  <Code2 className="h-4 w-4 mr-1" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="split" className="btn-hover-scale shadow-hover">
                  Split
                </TabsTrigger>
                <TabsTrigger value="preview" className="btn-hover-scale shadow-hover">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" className="btn-hover-bounce shadow-hover">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <div className="flex gap-1">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 btn-hover-glow shadow-hover"
                onClick={exportReadme}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export README
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 btn-hover-glow shadow-hover">
                <Globe className="h-4 w-4 mr-2" />
                Generate Site
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Sections */}
        <div className="w-64 border-r bg-white overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Sections</h3>
              <Button size="sm" variant="outline" onClick={addSection} className="btn-hover-bounce shadow-hover">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    section.enabled
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium truncate">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-3 h-3 rounded-full ${
                          section.enabled ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSection(section.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {section.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Editor Panel */}
          {(activeView === 'edit' || activeView === 'split') && (
            <div className={`${activeView === 'split' ? 'w-1/2' : 'w-full'} border-r bg-white overflow-y-auto`}>
              <div className="p-6 space-y-6">
                {/* Project Header */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Title</label>
                      <Input
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="Enter project title"
                        className="btn-hover-scale shadow-hover"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="Enter project description"
                        rows={3}
                        className="btn-hover-scale shadow-hover"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Sections */}
                {sections.filter(section => section.enabled).map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                        className="font-semibold text-lg border-none p-0 focus:outline-none focus:ring-0"
                      />
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={section.content}
                        onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                        rows={12}
                        className="font-mono text-sm btn-hover-scale shadow-hover"
                        placeholder="Write your content in Markdown..."
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Preview Panel */}
          {(activeView === 'preview' || activeView === 'split') && (
            <div className={`${activeView === 'split' ? 'w-1/2' : 'w-full'} bg-white overflow-y-auto`}>
              <div className="p-6">
                <div className="prose max-w-none">
                  {/* Project Header */}
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{projectTitle}</h1>
                    <p className="text-lg text-gray-600">{projectDescription}</p>
                  </div>

                  {/* Rendered Sections */}
                  {sections.filter(section => section.enabled).map((section) => (
                    <div key={section.id} className="mb-8">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(section.content)
                        }}
                        className="prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}