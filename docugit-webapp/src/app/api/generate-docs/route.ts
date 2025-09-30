import { NextRequest, NextResponse } from 'next/server'
import { githubService } from '@/lib/github'
import { documentationEngine, DocumentationConfig } from '@/lib/documentation-engine'

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, config, stream } = await request.json()

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

    console.log(`📚 Generating documentation for: ${owner}/${repoName}`)
    console.log('📋 Config:', config)

    const docConfig: DocumentationConfig = {
      mode: config?.mode || 'full-site',
      theme: config?.theme || 'github',
      includeApi: config?.includeApi ?? true,
      includeContributing: config?.includeContributing ?? true,
      includeChangelog: config?.includeChangelog ?? true,
      includeExamples: config?.includeExamples ?? true,
      realTimeUpdates: stream
    }

    // If streaming is requested, use Server-Sent Events
    if (stream) {
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          try {
            let currentProgress = 0

            // Step 1: Analyze repository
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              current: 1,
              total: 10,
              message: '🔍 Analyzing repository...',
              percentage: 10
            })}\n\n`))

            const repository = await githubService.analyzeRepository(repoUrl, (progress) => {
              const data = `data: ${JSON.stringify({
                type: 'progress',
                ...progress
              })}\n\n`
              controller.enqueue(encoder.encode(data))
            })

            // Step 2: Generate documentation
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              current: 8,
              total: 10,
              message: '📚 Generating documentation site...',
              percentage: 80
            })}\n\n`))

            const documentation = await documentationEngine.generateDocumentation(
              repository,
              docConfig,
              (progress) => {
                const adjustedProgress = {
                  ...progress,
                  current: 8 + Math.round(progress.current / progress.total),
                  total: 10,
                  percentage: 80 + Math.round((progress.percentage * 20) / 100)
                }
                const data = `data: ${JSON.stringify({
                  type: 'doc_progress',
                  ...adjustedProgress
                })}\n\n`
                controller.enqueue(encoder.encode(data))
              }
            )

            // Send final result
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'complete',
              repository,
              documentation,
              percentage: 100
            })}\n\n`))

            controller.close()
          } catch (error: any) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: error.message || 'Failed to generate documentation'
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
    const repository = await githubService.analyzeRepository(repoUrl)

    console.log(`📊 Repository data fetched, generating documentation...`)

    const documentation = await documentationEngine.generateDocumentation(
      repository,
      docConfig
    )

    console.log(`✅ Documentation generated successfully`)

    return NextResponse.json({
      success: true,
      repository,
      documentation
    })

  } catch (error: any) {
    console.error('❌ Documentation generation failed:', error)

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
      { error: 'Failed to generate documentation. Please try again.' },
      { status: 500 }
    )
  }
}