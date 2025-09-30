'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { DocumentationSite } from '@/lib/documentation-engine'

export default function PreviewPage() {
  const params = useParams()
  const [documentation, setDocumentation] = useState<DocumentationSite | null>(null)
  const [currentPage, setCurrentPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, you'd fetch the documentation from an API
    // For now, we'll use mock data or get it from localStorage/sessionStorage
    const mockDocumentation: DocumentationSite = {
      config: {
        mode: 'full-site',
        theme: 'github',
        includeApi: true,
        includeContributing: true,
        includeChangelog: true,
        includeExamples: true
      },
      pages: [
        {
          path: '/README.md',
          title: 'Home',
          content: `# ${params.repo}

Welcome to the comprehensive documentation for ${params.repo}. This project demonstrates modern development practices and provides a robust foundation for building scalable applications.

## Quick Start

\`\`\`bash
git clone https://github.com/user/${params.repo}
cd ${params.repo}
npm install
npm run dev
\`\`\`

## Features

- 🚀 **Fast Development** - Hot reload and instant feedback
- 📦 **Modern Stack** - Built with the latest technologies
- 🛡️ **Type Safe** - Full TypeScript support
- 🎨 **Beautiful UI** - Carefully crafted components
- 📱 **Responsive** - Works on all devices

## Architecture

This project follows clean architecture principles with clear separation of concerns.`,
          type: 'markdown',
          order: 1
        },
        {
          path: '/getting-started.md',
          title: 'Getting Started',
          content: `# Getting Started

This guide will help you get up and running with ${params.repo} in no time.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/user/${params.repo}
   cd ${params.repo}
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   Navigate to \`http://localhost:3000\` to see your application running.

## Configuration

The project uses environment variables for configuration. Copy the example file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Then update the variables according to your needs.`,
          type: 'markdown',
          order: 2
        },
        {
          path: '/api.md',
          title: 'API Reference',
          content: `# API Reference

Complete API documentation for ${params.repo}.

## Authentication

All API requests require authentication using a bearer token:

\`\`\`bash
Authorization: Bearer <your-token>
\`\`\`

## Endpoints

### GET /api/users

Returns a list of all users.

**Response:**
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
\`\`\`

### POST /api/users

Creates a new user.

**Request Body:**
\`\`\`json
{
  "name": "string",
  "email": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
\`\`\``,
          type: 'markdown',
          order: 3
        }
      ],
      navigation: [
        { title: 'Home', path: '/README.md' },
        { title: 'Getting Started', path: '/getting-started.md' },
        { title: 'API Reference', path: '/api.md' }
      ],
      assets: ['/assets/style.css', '/assets/app.js'],
      generatedAt: new Date().toISOString(),
      repository: params.repo as string
    }

    setDocumentation(mockDocumentation)
    setCurrentPage(mockDocumentation.pages[0])
    setLoading(false)
  }, [params.repo])

  const handleNavigation = (path: string) => {
    const page = documentation?.pages.find(p => p.path === path)
    if (page) {
      setCurrentPage(page)
    }
  }

  const renderMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 text-gray-800 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-3 text-gray-700 mt-6">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>')
      .replace(/```([^`]+)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 border"><code class="text-sm">$1</code></pre>')
      .replace(/^- (.*$)/gim, '<li class="mb-2 text-gray-700">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!documentation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Documentation Not Found</h1>
          <p className="text-gray-600">The requested documentation could not be loaded.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📚</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {documentation.repository}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Generated {new Date(documentation.generatedAt).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                🤖 AI Generated
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen sticky top-16">
          <nav className="p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Documentation
            </h2>
            <ul className="space-y-2">
              {documentation.navigation.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      currentPage?.path === item.path
                        ? 'bg-orange-100 text-orange-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto px-8 py-8">
          {currentPage && (
            <article
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(currentPage.content)
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}