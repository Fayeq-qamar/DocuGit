import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { analyzeRepositoryViaAPI } from '@/lib/github-fetcher'
import { analyzeRepositoryData } from '@/lib/in-memory-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repositoryData, fileContents } = body

    // Validate input
    if (!repositoryData) {
      return NextResponse.json({ error: 'Repository data is required' }, { status: 400 })
    }

    const { owner, repo } = repositoryData
    const branch = repositoryData.branch || 'main'
    const accessToken = request.headers.get('x-github-token') || process.env.GITHUB_TOKEN

    console.log(`📊 Analyzing repository via GitHub API for documentation: ${owner}/${repo}`)

    // Fetch repository data via GitHub API (no cloning!)
    const repoData = await analyzeRepositoryViaAPI(owner, repo, branch, accessToken)

    console.log(`✅ Fetched ${repoData.sourceFiles.length} source files from GitHub`)

    // Analyze files in-memory using AST parsing
    const analysis = analyzeRepositoryData(repoData.sourceFiles, repoData.packageJson)

    console.log(`✅ Deep analysis complete:`)
    console.log(`  - Files: ${analysis.metrics.totalFiles}`)
    console.log(`  - Functions: ${analysis.metrics.totalFunctions}`)
    console.log(`  - Components: ${analysis.metrics.totalComponents}`)
    console.log(`  - API Endpoints: ${analysis.metrics.totalAPIEndpoints}`)
    console.log(`  - Average Complexity: ${analysis.metrics.averageComplexity}`)
    console.log(`  - Technologies: ${analysis.technologies.join(', ')}`)

    // Read the deep documentation system prompt exactly as written
    const promptPath = path.join(process.cwd(), '..', 'deep-documentation-system-prompt.md')
    let deepDocumentationPrompt: string

    try {
      deepDocumentationPrompt = await fs.readFile(promptPath, 'utf-8')
      console.log('✅ Successfully loaded deep documentation prompt')
    } catch (error) {
      console.error('❌ Failed to load deep documentation prompt:', error)
      throw new Error('Could not load documentation prompt file')
    }

    // Create user prompt with REAL analysis data
    const userPrompt = `Generate comprehensive technical documentation for this ${repositoryData.language} repository: ${repositoryData.fullName}

Repository Analysis Data:
- Name: ${repositoryData.repo}
- Full Name: ${repositoryData.fullName}
- Language: ${repositoryData.language}
- Description: ${repositoryData.description}
- Stars: ${repositoryData.stars}
- Forks: ${repositoryData.forks}
- Topics: ${repositoryData.topics?.join(', ') || 'N/A'}

## COMPREHENSIVE REPOSITORY ANALYSIS (Use this exact data for documentation):

### Architecture Overview
- Framework: ${analysis.architecture.framework}
- Language: ${analysis.architecture.language}
- Database: ${analysis.architecture.database || 'None detected'}
- Authentication: ${analysis.architecture.authentication || 'None detected'}
- Styling: ${analysis.architecture.styling || 'None detected'}
- Testing Framework: ${analysis.architecture.testing || 'None detected'}

### Repository Metrics
- Total Files: ${analysis.metrics.totalFiles}
- Total Directories: ${analysis.metrics.totalDirectories}
- Total Lines of Code: ${analysis.metrics.totalLines}
- Total Functions: ${analysis.metrics.totalFunctions}
- Total Classes: ${analysis.metrics.totalClasses}
- Total React Components: ${analysis.metrics.totalComponents}
- Total API Endpoints: ${analysis.metrics.totalAPIEndpoints}
- Average Cyclomatic Complexity: ${analysis.metrics.averageComplexity}
- Language Breakdown: ${JSON.stringify(analysis.metrics.languageBreakdown)}

### Complete API Endpoints Documentation
${analysis.apiEndpoints.map((endpoint, idx) => `
${idx + 1}. ${endpoint.method} ${endpoint.path}
   - File: ${endpoint.file}
   - Handler Function: ${endpoint.handler}
   - Line Number: ${endpoint.lineNumber}
`).join('\n')}

### React Components Analysis
${analysis.components.map((comp, idx) => `
${idx + 1}. ${comp.name}
   - Type: ${comp.type}
   - File: ${comp.file}
   - Exports: ${comp.exports.join(', ')}
`).join('\n')}

### Dependencies Analysis
- Total Dependencies: ${analysis.dependencies.totalCount}
- Production Dependencies: ${Object.keys(analysis.dependencies.production).length}
- Development Dependencies: ${Object.keys(analysis.dependencies.development).length}

Frameworks Detected:
${analysis.dependencies.frameworks.map(f => `- ${f}`).join('\n')}

UI Libraries Detected:
${analysis.dependencies.uiLibraries.map(lib => `- ${lib}`).join('\n')}

Databases Detected:
${analysis.dependencies.databases.map(db => `- ${db}`).join('\n')}

### Complete File Tree Structure
${JSON.stringify(analysis.fileTree, null, 2)}

### Detailed Source Files Analysis (Top 20 Files)
${analysis.sourceFiles.slice(0, 20).map((file, idx) => `
## File ${idx + 1}: ${file.path}
- Language: ${file.language}
- Lines of Code: ${file.linesOfCode}
- Cyclomatic Complexity: ${file.complexity}
- Functions Count: ${file.functions.length}
- Classes Count: ${file.classes.length}

### Functions in this file:
${file.functions.map(func => `
- **${func.name}**
  - Parameters: ${func.params.join(', ')}
  - Lines: ${func.lineStart}-${func.lineEnd}
  - Complexity: ${func.complexity}
  - Async: ${func.isAsync}
  - Exported: ${func.isExported}
  ${func.docComment ? `- Documentation: ${func.docComment}` : ''}
`).join('\n')}

### Classes in this file:
${file.classes.map(cls => `
- **${cls.name}**
  - Methods: ${cls.methods.join(', ')}
  - Properties: ${cls.properties.join(', ')}
  - Lines: ${cls.lineStart}-${cls.lineEnd}
  ${cls.extends ? `- Extends: ${cls.extends}` : ''}
  ${cls.implements ? `- Implements: ${cls.implements.join(', ')}` : ''}
`).join('\n')}

### Imports in this file:
${file.imports.map(imp => `- ${imp.specifiers.join(', ')} from '${imp.source}'`).join('\n')}

### Exports from this file:
${file.exports.map(exp => `- ${exp.name} (${exp.type})`).join('\n')}
`).join('\n\n')}

### Configuration Files Found
${Object.keys(analysis.configFiles).map(config => `- ${config}`).join('\n')}

Follow the deep documentation system prompt EXACTLY. Use this REAL analysis data to:
1. Generate accurate Mermaid architecture diagrams showing actual components
2. Create sequence diagrams for real API endpoints
3. Document every function and class found
4. Create accurate ERD diagrams if database schemas are present
5. Generate dependency graphs based on real import/export analysis
6. Document exact file structure with metrics
7. Provide line-by-line analysis for critical files

DO NOT make up or guess information. USE ONLY THE REAL DATA PROVIDED ABOVE.`

    // Call OpenAI API with GPT-4o-mini
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: deepDocumentationPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 16000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate documentation', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      )
    }

    const generatedContent = data.choices[0].message.content

    // Parse the generated content into sections for the editor
    const sections = parseDocumentationToSections(generatedContent, repositoryData)

    return NextResponse.json({
      success: true,
      content: generatedContent,
      sections: sections,
      usage: data.usage || {},
      model: 'gpt-4o-mini',
      type: 'documentation'
    })

  } catch (error) {
    console.error('Documentation generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to parse generated documentation into sections
function parseDocumentationToSections(markdown: string, repositoryData: any) {
  const sections: any[] = []
  const lines = markdown.split('\n')
  let currentSection: string | null = null
  let sectionContent: string[] = []
  let sectionCounter = 1

  for (const line of lines) {
    // Split on major sections (### SECTION) and main headers (# and ##)
    if (line.match(/^#{1,3}\s/) || line.match(/^###\s*SECTION\s*\d+/)) {
      // Save previous section if it exists
      if (currentSection) {
        sections.push({
          id: sectionCounter.toString(),
          title: currentSection,
          content: sectionContent.join('\n').trim(),
          enabled: true,
          type: getDocumentationSectionType(currentSection)
        })
        sectionCounter++
      }

      // Start new section
      currentSection = line.replace(/^#{1,3}\s*/, '').replace(/^SECTION\s*\d+:\s*/, '').trim()
      sectionContent = [line]
    } else {
      // Add line to current section
      sectionContent.push(line)
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push({
      id: sectionCounter.toString(),
      title: currentSection,
      content: sectionContent.join('\n').trim(),
      enabled: true,
      type: getDocumentationSectionType(currentSection)
    })
  }

  // If no sections were found, create a single section with all content
  if (sections.length === 0) {
    sections.push({
      id: '1',
      title: `${repositoryData.repo} - Complete Documentation`,
      content: markdown,
      enabled: true,
      type: 'overview'
    })
  }

  return sections
}

// Helper function to determine documentation section type
function getDocumentationSectionType(title: string): string {
  const titleLower = title.toLowerCase()

  if (titleLower.includes('executive summary') || titleLower.includes('overview')) return 'overview'
  if (titleLower.includes('architecture') || titleLower.includes('design')) return 'architecture'
  if (titleLower.includes('file-by-file') || titleLower.includes('analysis')) return 'analysis'
  if (titleLower.includes('code quality') || titleLower.includes('metrics')) return 'quality'
  if (titleLower.includes('security') || titleLower.includes('audit')) return 'security'
  if (titleLower.includes('database') || titleLower.includes('schema')) return 'database'
  if (titleLower.includes('api') || titleLower.includes('endpoint')) return 'api'
  if (titleLower.includes('test') || titleLower.includes('coverage')) return 'testing'
  if (titleLower.includes('performance') || titleLower.includes('profiling')) return 'performance'
  if (titleLower.includes('deployment') || titleLower.includes('infrastructure')) return 'deployment'
  if (titleLower.includes('developer') || titleLower.includes('guide')) return 'guides'
  if (titleLower.includes('maintenance') || titleLower.includes('debt')) return 'maintenance'
  if (titleLower.includes('monitoring') || titleLower.includes('observability')) return 'monitoring'
  if (titleLower.includes('knowledge') || titleLower.includes('adr')) return 'knowledge'
  if (titleLower.includes('appendix') || titleLower.includes('reference')) return 'appendix'

  return 'custom'
}