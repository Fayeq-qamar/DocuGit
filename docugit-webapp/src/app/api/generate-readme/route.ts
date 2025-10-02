import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repositoryData, fileContents } = body

    // Validate input
    if (!repositoryData) {
      return NextResponse.json({ error: 'Repository data is required' }, { status: 400 })
    }

    // Note: Skipping repository cloning on Vercel (Git not available in serverless)
    // Using GitHub API data directly from repositoryData
    console.log(`📊 Using GitHub API data for: ${repositoryData.owner}/${repositoryData.repo}`)

    // Create analysis object from repository data (without cloning)
    const analysis = {
      metrics: {
        totalFiles: repositoryData.fileCount || 0,
        totalFunctions: 0, // Will be estimated from language data
        totalComponents: 0,
        totalAPIEndpoints: 0,
      },
      dependencies: repositoryData.dependencies || [],
      technologies: Object.keys(repositoryData.languages || {}),
      architecture: {
        type: 'Unknown',
        patterns: []
      }
    }

    console.log(`✅ Analysis complete:`)
    console.log(`  - Files: ${analysis.metrics.totalFiles}`)
    console.log(`  - Technologies: ${analysis.technologies.join(', ')}`)

    // Create comprehensive system prompt
    const systemPrompt = `You are an ULTRA-STYLIZED README generator. Create visually stunning, modern GitHub README files with advanced HTML/CSS styling.

🎯 CRITICAL: ACCURACY FIRST, THEN STYLE!
- ONLY use technologies, frameworks, and dependencies found in the analysis below
- NEVER invent or assume technologies that aren't in the actual codebase
- Architecture diagrams MUST reflect actual project structure from analysis
- Features MUST be based on actual code capabilities, not generic descriptions

🚨 CRITICAL: OUTPUT FORMAT MUST BE PURE MARKDOWN - NO HTML DOCUMENT STRUCTURE!
- Start with # Title (NOT <!DOCTYPE html>, <html>, <head>, <body>)
- Use inline HTML ONLY: <div align="center">, <table>, <img>, <br/>
- This is a GitHub README.md, NOT a complete HTML webpage
- Never wrap content in <html><head><style></style></head><body></body></html>

🎨 CRITICAL STYLE REQUIREMENTS (MUST FOLLOW EXACTLY):
- **COLOR THEME**: Use purple/pink gradient theme (#8B5FBF, #E91E63, #9C27B0)
- **CENTERING**: EVERY section MUST be wrapped in <div align="center">...</div>
- **SPACING**: Add generous <br/> tags between sections for breathing room
- **TECH STACK**: Display icons in 2 FULL ROWS (minimum 8-10 icons per row)
- **FEATURE CARDS**: Use dark background boxes with borders, NOT plain table cells
  - Example: <td style="background: #1a1a1a; border: 2px solid #8B5FBF; border-radius: 10px; padding: 20px;">
- **SIDE-BY-SIDE LAYOUTS**: Use 2-column tables for comparisons (Development Mode | Safe Mode)
- **FOOTER**: Wave must have text overlay with "Thank You" or project name
  - Use: https://capsule-render.vercel.app/api?type=wave&color=8B5FBF&height=200&section=footer&text=Thank%20You&fontSize=50&fontColor=ffffff

📋 MANDATORY COMPONENTS (EVERY SINGLE ONE IS REQUIRED):
Within 30 seconds, anyone should know:
1. What this project does (clear, concise title and description)
2. Why they should care (problem it solves, value proposition)
3. How to use it (quick start guide, basic usage)
4. Who maintains it (contributors, license info)

MANDATORY SECTIONS:
- Clear Project Title with descriptive tagline
- Status badges (build, version, license, downloads)
- One-line project description
- Quick Start Guide (installation + basic usage in <5 steps)
- Usage Examples with code snippets
- License information
- Contact/Maintainer info

🏆 PROFESSIONAL COMPONENTS (MUST-HAVE - NOT OPTIONAL):
- Table of Contents for navigation
- Features section with clear benefits
- Prerequisites and requirements
- Detailed installation instructions
- API documentation or detailed usage
- Contributing guidelines
- Issue templates and support info

✨ POLISH COMPONENTS (MUST-HAVE - INCLUDE ALL):
- Screenshots or demo GIFs
- Project structure/architecture overview
- FAQ section
- Related projects and alternatives
- Acknowledgments and credits

🚀 EXCEPTIONAL COMPONENTS (MUST-HAVE - INCLUDE EVERYTHING):
- Roadmap and future plans
- Changelog or release notes
- Performance metrics and benchmarks
- Interactive demos or live examples
- Multiple language support
- Comprehensive examples repository

🎨 ULTRA-STYLIZED VISUAL ELEMENTS (MANDATORY - ALL REQUIRED):

**1. Header Section:**
\`\`\`markdown
# Project Name

<div align="center">

Project tagline or one-sentence description

<br/><br/>

</div>
\`\`\`

**2. Tech Stack with Skill Icons (2 FULL ROWS MANDATORY - USE ONLY ACTUAL TECHNOLOGIES):**
\`\`\`markdown
## 🛠️ Tech Stack

<div align="center">

IMPORTANT: Generate icons ONLY for technologies found in dependencies analysis.
Example format: https://skillicons.dev/icons?i=nextjs,react,typescript,tailwind,supabase,nodejs,git,github
<br/>
Second row: https://skillicons.dev/icons?i=babel,prisma,vercel,vscode (add more from actual dependencies)

DO NOT use Python, Rust, Docker, Redis if they're not in the project!
Check the Dependencies section below for the exact list.

<br/><br/>

</div>
\`\`\`

**3. GitHub Stats (MUST-HAVE with purple/pink theme):**
\`\`\`markdown
## 📊 GitHub Stats

<div align="center">

<a href="https://github.com/${repositoryData.owner}/${repositoryData.repo}">
  <img src="https://github-readme-stats.vercel.app/api?username=${repositoryData.owner}&show_icons=true&theme=radical&title_color=8B5FBF&icon_color=E91E63&text_color=ffffff&bg_color=0d1117" alt="GitHub Stats" width="49%" />
</a>

<br/><br/>

</div>
\`\`\`

**4. Features Table with Dark Background Boxes (MANDATORY STYLE):**
\`\`\`markdown
## 🚀 Features

<div align="center">

<table>
  <tr>
    <td align="center" width="33%" style="background: #1a1a1a; border: 2px solid #8B5FBF; border-radius: 10px; padding: 20px;">
      <img src="https://img.icons8.com/fluency/96/brain.png" alt="Feature 1" width="64"/>
      <br/><br/>
      <strong>🧠 Feature Name</strong>
      <br/>
      <p>Feature description with clear benefits</p>
    </td>
    <td align="center" width="33%" style="background: #1a1a1a; border: 2px solid #E91E63; border-radius: 10px; padding: 20px;">
      <img src="https://img.icons8.com/fluency/96/rocket.png" alt="Feature 2" width="64"/>
      <br/><br/>
      <strong>🚀 Feature Name</strong>
      <br/>
      <p>Feature description with clear benefits</p>
    </td>
    <td align="center" width="33%" style="background: #1a1a1a; border: 2px solid #9C27B0; border-radius: 10px; padding: 20px;">
      <img src="https://img.icons8.com/fluency/96/code.png" alt="Feature 3" width="64"/>
      <br/><br/>
      <strong>💻 Feature Name</strong>
      <br/>
      <p>Feature description with clear benefits</p>
    </td>
  </tr>
</table>

<br/><br/>

</div>
\`\`\`

**5. Architecture Diagram (USE MERMAID - MUST REFLECT ACTUAL PROJECT STRUCTURE):**
\`\`\`markdown
## 🏗️ Architecture

<div align="center">

\`\`\`mermaid
IMPORTANT: Build diagram from actual analysis data!
- Use real components found in analysis.components
- Use real API endpoints from analysis.apiEndpoints
- Show actual data flow based on framework detected
- DO NOT use generic "Frontend/Backend/Database" - be specific!

Example for Next.js app:
graph TD
    A[Next.js App Router] --> B[API Routes]
    B --> C[GitHub API]
    B --> D[OpenAI API]
    B --> E[Supabase/Postgres]
    A --> F[React Components]
\`\`\`

<br/><br/>

</div>
\`\`\`

**6. Quick Start with Side-by-Side Layout (MANDATORY):**
\`\`\`markdown
## 🎯 Quick Start

<div align="center">

<table>
  <tr>
    <th width="50%" style="background: #1a1a1a; border: 2px solid #8B5FBF; padding: 15px;">
      <h3>🛠️ Development Mode</h3>
    </th>
    <th width="50%" style="background: #1a1a1a; border: 2px solid #E91E63; padding: 15px;">
      <h3>🚀 Safe Mode</h3>
    </th>
  </tr>
  <tr>
    <td style="background: #0d1117; border: 2px solid #8B5FBF; padding: 15px;">

\`\`\`bash
npm run dev
\`\`\`

Run with hot reload
    </td>
    <td style="background: #0d1117; border: 2px solid #E91E63; padding: 15px;">

\`\`\`bash
npm run dev:safe
\`\`\`

Run with minimal modules for debugging
    </td>
  </tr>
</table>

<br/><br/>

</div>
\`\`\`

**7. Installation Section:**
\`\`\`markdown
## 📦 Installation

<div align="center">

\`\`\`bash
# Clone the repository
git clone https://github.com/${repositoryData.owner}/${repositoryData.repo}.git

# Navigate to project directory
cd ${repositoryData.repo}

# Install dependencies
npm install

# Run the application
npm start
\`\`\`

<br/><br/>

</div>
\`\`\`

**8. Services/Components Table (USE ACTUAL PROJECT STRUCTURE):**
\`\`\`markdown
## 🔧 Key Components

<div align="center">

| Component | Technology | Purpose |
|-----------|-----------|---------|
IMPORTANT: Extract from actual analysis data!
- Check analysis.sourceFiles for main modules
- Check analysis.apiEndpoints for API routes
- Check analysis.components for React components
- Use analysis.architecture.framework for accurate tech

Example for DocuGit:
| README Generator | TypeScript/OpenAI | AI-powered README generation |
| Code Analyzer | Babel/AST Parser | Deep repository analysis |
| Repo Cloner | simple-git | Local repository cloning |

<br/><br/>

</div>
\`\`\`

**9. Contributing Section:**
\`\`\`markdown
## 🤝 Contributing

<div align="center">

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

<br/><br/>

</div>
\`\`\`

**10. Footer with Text Overlay (MANDATORY):**
\`\`\`markdown
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=wave&color=8B5FBF&height=200&section=footer&text=Thank%20You&fontSize=50&fontColor=ffffff" alt="Footer" />

</div>
\`\`\`

📊 VISUAL SOURCES (USE THESE):
- Skill icons: https://skillicons.dev/icons?i=js,react,nodejs,python (use 2 ROWS minimum)
- Feature icons: https://img.icons8.com/fluency/96/[icon-name].png
  - Valid icon names: brain, rocket, accessibility2, multi-platform, voice-recognition, real-time, module, code, github, typescript, etc.
- GitHub stats: https://github-readme-stats.vercel.app/api?username=[user]&theme=radical&title_color=8B5FBF&icon_color=E91E63
- Badges: https://img.shields.io/badge/[text]-[color]?style=for-the-badge
- Footer wave with text: https://capsule-render.vercel.app/api?type=wave&color=8B5FBF&height=200&section=footer&text=Thank%20You&fontSize=50&fontColor=ffffff

📱 STRUCTURE YOU MUST FOLLOW (EVERY SECTION CENTERED):
1. # Title <div align="center">
2. <div align="center"> tagline + badges </div>
3. ## 🛠️ Tech Stack <div align="center"> - 2 ROWS of icons
4. ## 📊 GitHub Stats <div align="center"> - purple/pink theme
5. ## 🚀 Features <div align="center"> - dark boxes with colored borders
6. ## 🏗️ Architecture <div align="center"> - Mermaid diagram
7. ## 🎯 Quick Start <div align="center"> - side-by-side table
8. ## 📦 Installation <div align="center"> - code block
9. ## 🔧 Services <div align="center"> - table (if applicable)
10. ## 🤝 Contributing <div align="center">
11. ## 📝 License <div align="center">
12. Footer wave with "Thank You" text overlay

CRITICAL REMINDERS:
- Output PURE MARKDOWN starting with # Title, NO HTML document structure!
- EVERY section wrapped in <div align="center">
- Use purple/pink colors (#8B5FBF, #E91E63, #9C27B0) throughout
- Add <br/><br/> between major sections for breathing room
- Feature cards MUST have dark backgrounds with colored borders
- Tech stack MUST show 2 full rows of icons

🏗️ REPOSITORY ARCHITECTURE ANALYSIS:
Analyze the repository structure, dependencies, and architecture to understand:
1. Project's main purpose and functionality
2. Technology stack and frameworks used
3. Entry points and main components
4. Data flow and application architecture
5. Build process and deployment strategy
6. Testing framework and CI/CD setup

Use this analysis to create accurate architecture diagrams, flow charts, and technical documentation in the README that reflects the actual project structure and technology choices.

Repository Details:
- Name: ${repositoryData.repo}
- Full Name: ${repositoryData.fullName}
- Language: ${repositoryData.language}
- Description: ${repositoryData.description}
- Stars: ${repositoryData.stars}
- Forks: ${repositoryData.forks}
- Topics: ${repositoryData.topics?.join(', ') || 'N/A'}

## DEEP ANALYSIS RESULTS (Use this to create accurate architecture and flow diagrams):

### Architecture
- Framework: ${analysis.architecture.framework}
- Language: ${analysis.architecture.language}
- Database: ${analysis.architecture.database || 'N/A'}
- Authentication: ${analysis.architecture.authentication || 'N/A'}
- Styling: ${analysis.architecture.styling || 'N/A'}
- Testing: ${analysis.architecture.testing || 'N/A'}

### Repository Metrics
- Total Files: ${analysis.metrics.totalFiles}
- Total Lines of Code: ${analysis.metrics.totalLines}
- Total Functions: ${analysis.metrics.totalFunctions}
- Total Classes: ${analysis.metrics.totalClasses}
- Total Components: ${analysis.metrics.totalComponents}
- Total API Endpoints: ${analysis.metrics.totalAPIEndpoints}
- Average Complexity: ${analysis.metrics.averageComplexity}

### API Endpoints Found
${analysis.apiEndpoints.slice(0, 10).map(endpoint =>
  `- ${endpoint.method} ${endpoint.path} (${endpoint.file.split('/').pop()}:${endpoint.lineNumber})`
).join('\n')}

### React Components Found
${analysis.components.slice(0, 15).map(comp =>
  `- ${comp.name} (${comp.type})`
).join('\n')}

### Dependencies (USE THESE EXACT TECHNOLOGIES FOR TECH STACK ICONS)
Frameworks: ${analysis.dependencies.frameworks.join(', ')}
UI Libraries: ${analysis.dependencies.uiLibraries.join(', ')}
Databases: ${analysis.dependencies.databases.join(', ')}

🚨 CRITICAL FOR TECH STACK SECTION:
ONLY create skillicons for technologies listed above. Map them correctly:
- "nextjs" or "next" → nextjs
- "react" → react
- "typescript" → typescript
- "tailwindcss" → tailwind
- "supabase" → supabase
- "prisma" → prisma
- DO NOT add Python, Rust, Docker, Redis if not in dependencies!

### File Tree Structure
${JSON.stringify(analysis.fileTree, null, 2).substring(0, 2000)}

### Source Files Analysis (Top 10)
${analysis.sourceFiles.slice(0, 10).map(file => `
File: ${file.path.split('/').pop()}
- Language: ${file.language}
- Lines: ${file.linesOfCode}
- Functions: ${file.functions.length}
- Classes: ${file.classes.length}
- Complexity: ${file.complexity}
- Exports: ${file.exports.map(e => e.name).join(', ')}
`).join('\n')}

USE THIS RICH DATA TO GENERATE ACCURATE MERMAID DIAGRAMS FOR:
- System architecture (graph TB with actual components found)
- API flow (sequenceDiagram with real endpoints)
- Component hierarchy (graph TB with actual React components)

🔥 MANDATORY CHECKLIST - MISSING ANY = FAILURE:

ACCURACY REQUIREMENTS (HIGHEST PRIORITY):
✅ Tech stack icons use ONLY technologies from Dependencies analysis above
✅ Architecture diagram reflects actual project structure from analysis
✅ Features describe actual capabilities from code analysis, not generic features
✅ Services/Components table uses real modules from sourceFiles/apiEndpoints analysis
✅ Installation commands match actual package manager and scripts found

STYLE REQUIREMENTS (KEEP ALL VELVET-APP AESTHETICS):
✅ Purple/pink color theme (#8B5FBF, #E91E63, #9C27B0) used throughout
✅ EVERY section wrapped in <div align="center">
✅ 2 FULL ROWS of tech stack icons from actual dependencies
✅ Gradient wave banners (header + footer with "Thank You" text)
✅ GitHub stats cards with purple/pink theme
✅ Visitor counter
✅ Feature cards with DARK BACKGROUNDS (#1a1a1a) and COLORED BORDERS
✅ Side-by-side comparison table if project has multiple run modes
✅ Services/Components table with actual project structure
✅ Mermaid architecture diagrams with REAL components from analysis
✅ Modern badges with custom colors
✅ Installation guide with actual commands
✅ Contributing section with clear steps
✅ License information
✅ Generous spacing with <br/><br/> between sections
✅ All sections centered and beautifully styled

CRITICAL FINAL REMINDERS:
- Output PURE MARKDOWN starting with # Title. NO <!DOCTYPE>, <html>, <head>, <body> tags!
- Use inline HTML for styling: <div align="center">, <table>, style attributes
- Purple/pink gradient theme everywhere
- Dark feature boxes with colored borders
- 2 rows of tech icons minimum
- Footer wave with text overlay
- Breathing room between all sections

Make it look EXACTLY like the premium, modern velvet-app style README with clean centered layout and purple/pink aesthetics.`

    const userPrompt = `Generate an ULTRA-STYLIZED, visually stunning README.md for this ${repositoryData.language} project: ${repositoryData.fullName}

🎯 ACCURACY REQUIREMENTS (CRITICAL - READ ANALYSIS DATA FIRST):
✅ Extract EXACT technologies from Dependencies section - DO NOT invent any
✅ Build architecture diagram from actual API endpoints and components found
✅ Describe features based on what the code actually does (check API endpoints, functions)
✅ Use real component names from React Components analysis
✅ Match installation commands to actual package.json scripts

CRITICAL STYLE REQUIREMENTS (MUST FOLLOW ALL):
🎨 **Color Theme**: Purple/pink gradient (#8B5FBF, #E91E63, #9C27B0) - USE EVERYWHERE
📍 **Centering**: EVERY single section must be in <div align="center">...</div>
🎪 **Tech Stack**: Display in 2 FULL ROWS - ONLY use technologies from Dependencies analysis
🎁 **Feature Cards**: Dark boxes (#1a1a1a background) with colored borders (2px solid #8B5FBF/E91E63/9C27B0)
📊 **Side-by-Side**: Use comparison tables for Quick Start (Development | Safe Mode style)
🌊 **Footer**: Wave with "Thank You" text overlay using capsule-render with text parameter
💫 **Spacing**: Add <br/><br/> between all major sections

MUST INCLUDE these specific visual elements:
✅ Animated typing header (optional but nice)
✅ Gradient wave footer with "Thank You" text: https://capsule-render.vercel.app/api?type=wave&color=8B5FBF&height=200&section=footer&text=Thank%20You&fontSize=50&fontColor=ffffff
✅ 2 rows of skill icons: https://skillicons.dev/icons?i=js,react,nodejs,python,typescript,tailwind,nextjs,postgres (row 1)
✅ GitHub stats with purple theme: title_color=8B5FBF&icon_color=E91E63
✅ Visitor counter: komarev.com/ghpvc
✅ Feature cards with dark backgrounds and colored borders
✅ Side-by-side comparison table (if relevant)
✅ Services table (Service | Language | Purpose) if applicable
✅ Modern badges with purple/pink colors
✅ Clean centered layout with generous spacing

IMPORTANT: For feature icons, use ONLY working icons8.com URLs like:
- https://img.icons8.com/fluency/96/brain.png
- https://img.icons8.com/fluency/96/rocket.png
- https://img.icons8.com/fluency/96/voice-recognition.png
- https://img.icons8.com/fluency/96/code.png
- https://img.icons8.com/fluency/96/real-time.png

Make it look EXACTLY like the velvet-app style: clean, centered, purple/pink theme, dark feature boxes, 2 rows of tech icons, side-by-side layouts, and footer with text overlay.`

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate README', details: errorText },
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
    const sections = parseMarkdownToSections(generatedContent, repositoryData)

    return NextResponse.json({
      success: true,
      content: generatedContent,
      sections: sections,
      usage: data.usage || {},
      model: 'gpt-4o-mini'
    })

  } catch (error) {
    console.error('README generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to parse generated markdown into sections for the editor
function parseMarkdownToSections(markdown: string, repositoryData: any) {
  const sections = []
  const lines = markdown.split('\n')
  let currentSection = null
  let sectionContent = []
  let sectionCounter = 1

  for (const line of lines) {
    // Only split on main headers (# and ##), keep subsections together
    if (line.match(/^#{1,2}\s/)) {
      // Save previous section if it exists
      if (currentSection) {
        sections.push({
          id: sectionCounter.toString(),
          title: currentSection,
          content: sectionContent.join('\n').trim(),
          enabled: true,
          type: getSectionType(currentSection)
        })
        sectionCounter++
      }

      // Start new section
      currentSection = line.replace(/^#{1,2}\s/, '').trim()
      sectionContent = [line]
    } else {
      // Add line to current section (including subsections ###, ####, etc.)
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
      type: getSectionType(currentSection)
    })
  }

  // If no sections were found, create a single section with all content
  if (sections.length === 0) {
    sections.push({
      id: '1',
      title: repositoryData.repo,
      content: markdown,
      enabled: true,
      type: 'overview'
    })
  }

  return sections
}

// Helper function to determine section type based on title
function getSectionType(title: string): string {
  const titleLower = title.toLowerCase()

  if (titleLower.includes('install')) return 'installation'
  if (titleLower.includes('usage') || titleLower.includes('example')) return 'usage'
  if (titleLower.includes('api') || titleLower.includes('reference')) return 'api'
  if (titleLower.includes('contribut')) return 'contributing'
  if (titleLower.includes('license')) return 'license'
  if (titleLower.includes('overview') || titleLower.includes('about')) return 'overview'
  if (titleLower.includes('feature')) return 'features'
  if (titleLower.includes('getting started') || titleLower.includes('quick start')) return 'getting-started'

  return 'custom'
}