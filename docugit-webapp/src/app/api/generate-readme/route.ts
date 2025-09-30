import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repositoryData, fileContents } = body

    // Validate input
    if (!repositoryData) {
      return NextResponse.json({ error: 'Repository data is required' }, { status: 400 })
    }

    // Create comprehensive system prompt
    const systemPrompt = `You are an ULTRA-STYLIZED README generator. Create visually stunning, modern GitHub README files with advanced HTML/CSS styling.

CRITICAL REQUIREMENTS - Generate with these elements:

🎨 ULTRA-STYLIZED HEADER:
- Animated typing SVG header using readme-typing-svg.herokuapp.com
- Gradient wave banner using capsule-render.vercel.app
- Beautiful badge collection with custom colors

📊 VISUAL COMPONENTS - USE ONLY THESE WORKING SOURCES:
- Skill icons: skillicons.dev/icons?i=js,html,css,react,python,typescript
- Feature icons: img.icons8.com/fluency/96/000000/[icon-name].png (verified working icons)
- GitHub stats: github-readme-stats.vercel.app/api/pin/?username=[user]&repo=[repo]
- Badges: img.shields.io/badge/[text]-[color]?style=for-the-badge
- Visitor counter: komarev.com/ghpvc/?username=[repo-name]

CRITICAL: Never use custom image URLs or placeholder text. Only use the exact formats above with real icon names from icons8.com like: rocket, code, github, typescript, etc.

🚀 MODERN FEATURES:
- HTML tables with centered content and icons
- Gradient backgrounds and styled sections
- Animated elements and visual separators
- Professional color schemes and branding

📱 STRUCTURE:
- Ultra-stylized animated header
- Beautiful tech stack display with icons
- Feature showcase in icon tables
- Detailed project info with visual elements
- Interactive installation guide
- Styled contribution section
- Footer with gradient wave

Use HTML extensively for styling, modern badges, gradient elements, and visual components. Make it look like a premium, modern web application README.

Repository Details:
- Name: ${repositoryData.repo}
- Full Name: ${repositoryData.fullName}
- Language: ${repositoryData.language}
- Description: ${repositoryData.description}
- Stars: ${repositoryData.stars}
- Forks: ${repositoryData.forks}
- Topics: ${repositoryData.topics?.join(', ') || 'N/A'}

${fileContents ? `Key Files Analysis:
${Object.entries(fileContents).map(([filename, content]) =>
  `${filename}:\n${typeof content === 'string' ? content.substring(0, 500) : JSON.stringify(content).substring(0, 500)}`
).join('\n\n')}` : ''}

Output only clean markdown content, no explanations or code blocks around the markdown.`

    const userPrompt = `Generate an ULTRA-STYLIZED, visually stunning README.md for this ${repositoryData.language} project: ${repositoryData.fullName}

MUST INCLUDE these specific visual elements:
🎨 Animated typing header: readme-typing-svg.herokuapp.com with project name
🌊 Gradient wave banners: capsule-render.vercel.app (header + footer)
📊 Skill icons: skillicons.dev/icons for tech stack
🏆 GitHub stats: github-readme-stats.vercel.app
👀 Visitor counter: komarev.com/ghpvc
📱 HTML tables with icons and styling for features
🎯 Modern badges with custom colors and gradients
⚡ Interactive elements and visual separators

IMPORTANT: For feature icons, use ONLY working icons8.com URLs like:
- https://img.icons8.com/fluency/96/000000/rocket.png
- https://img.icons8.com/fluency/96/000000/microphone.png
- https://img.icons8.com/fluency/96/000000/activity.png
- https://img.icons8.com/fluency/96/000000/code.png

Make it look like a premium, modern application with extensive HTML styling, not plain markdown. Use the visual style of top-tier open source projects.`

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://docugit.dev',
        'X-Title': 'DocuGit README Generator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
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
        max_tokens: 4000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
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
      model: 'deepseek/deepseek-chat-v3.1:free'
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