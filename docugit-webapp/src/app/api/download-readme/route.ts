import { NextRequest, NextResponse } from 'next/server'
import { githubService } from '@/lib/github'
import { generateUltraStylizedReadme } from '@/lib/readme-generator'

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json()

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      )
    }

    // Validate GitHub URL and extract owner/repo
    const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/
    const match = repoUrl.match(githubUrlPattern)

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL' },
        { status: 400 }
      )
    }

    const [, owner, repo] = match
    const repoName = repo.replace(/\.git$/, '') // Remove .git if present
    console.log(`Generating README for ${owner}/${repoName}`)

    // Analyze repository data (same as analyze endpoint)
    const repository = await githubService.analyzeRepository(repoUrl)

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found or not accessible' },
        { status: 404 }
      )
    }

    // Generate the README
    const readme = await generateUltraStylizedReadme(repository)

    // Create the response with proper headers for file download
    const response = new NextResponse(readme, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${repoName}-README.md"`,
        'Cache-Control': 'no-cache',
      },
    })

    return response
  } catch (error) {
    console.error('Error generating README for download:', error)
    return NextResponse.json(
      { error: 'Failed to generate README' },
      { status: 500 }
    )
  }
}