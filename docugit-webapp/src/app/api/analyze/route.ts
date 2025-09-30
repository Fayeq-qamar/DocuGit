import { NextRequest, NextResponse } from 'next/server'
import { githubService, createAuthenticatedGitHubService } from '@/lib/github'
import { createAIService } from '@/lib/ai-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserGitHubToken } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, stream } = await request.json()

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      )
    }

    // Get user session and their GitHub token
    const session = await getServerSession(authOptions)
    let gitHubService = githubService // default fallback

    if (session?.accessToken) {
      gitHubService = createAuthenticatedGitHubService(session.accessToken)
      console.log('🔑 Using authenticated GitHub service for user:', session.user?.name)
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

    console.log(`🔍 Analyzing repository: ${owner}/${repoName}`)

    // If streaming is requested, use Server-Sent Events
    if (stream) {
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          try {
            let currentProgress = 0

            // Analyze repository with progress callback
            const repository = await gitHubService.analyzeRepository(repoUrl, (progress) => {
              currentProgress = progress.percentage
              const data = `data: ${JSON.stringify({
                type: 'progress',
                ...progress
              })}\n\n`
              controller.enqueue(encoder.encode(data))
            })

            // Send completion of analysis
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'analysis_complete',
              message: '📊 Repository analysis complete, generating documentation...',
              percentage: 95
            })}\n\n`))

            // Generate documentation using AI
            const aiService = createAIService()
            const documentation = await aiService.generateDocumentation(repository, {
              type: 'readme',
              style: 'comprehensive'
            })

            // Send final result
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'complete',
              repository,
              documentation: {
                readme: documentation,
                generatedAt: new Date().toISOString(),
                repository: `${owner}/${repoName}`
              },
              percentage: 100
            })}\n\n`))

            controller.close()
          } catch (error: any) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: error.message || 'Failed to analyze repository'
            })}\n\n`))
            controller.close()
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Regular non-streaming response
    const repository = await gitHubService.analyzeRepository(repoUrl)

    console.log(`📊 Repository data fetched, generating documentation...`)

    // Generate documentation using AI
    const aiService = createAIService()
    const documentation = await aiService.generateDocumentation(repository, {
      type: 'readme',
      style: 'comprehensive'
    })

    console.log(`✅ Documentation generated successfully`)

    return NextResponse.json({
      success: true,
      repository,
      documentation: {
        readme: documentation,
        generatedAt: new Date().toISOString(),
        repository: `${owner}/${repoName}`
      }
    })

  } catch (error: any) {
    console.error('❌ Repository analysis failed:', error)

    // Handle specific GitHub API errors
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Repository not found or is private' },
        { status: 404 }
      )
    }

    if (error.status === 403) {
      return NextResponse.json(
        { error: 'GitHub API rate limit exceeded or insufficient permissions' },
        { status: 403 }
      )
    }

    if (error.message?.includes('404')) {
      return NextResponse.json(
        { error: 'Repository not found or is private' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze repository. Please try again.' },
      { status: 500 }
    )
  }
}