# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Documentation Website Generator - a web application that automatically generates comprehensive, professional documentation websites for GitHub repositories. The project allows users to input their repository URL, customize documentation sections, and export either a styled README.md or deploy a full documentation website.

## Architecture & Technology Stack

### Frontend Stack
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand/Redux Toolkit
- **Editor**: Monaco Editor / TipTap
- **Markdown Processing**: remark/rehype
- **Charts**: Recharts/D3.js
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

### Backend Stack
- **Runtime**: Node.js 20+
- **API**: Next.js API Routes / tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Queue**: BullMQ
- **Storage**: S3/Cloudflare R2
- **Auth**: NextAuth.js

### External Services
- GitHub API v4 (GraphQL)
- OpenAI API (content generation)
- Cloudflare (CDN/Images)
- Vercel/Netlify (deployment)
- Algolia (search)
- Sentry (error tracking)
- PostHog (analytics)

## Core Features

### Repository Analysis Engine
- Auto-detect programming languages
- Parse package.json, requirements.txt, Cargo.toml, etc.
- Extract existing README content
- Analyze file structure and identify test frameworks
- Detect CI/CD configurations
- Parse LICENSE file and extract contributor information

### Documentation Builder Interface
- Drag-and-drop section reordering
- Rich text editor (WYSIWYG) and Markdown editor with syntax highlighting
- Split-screen preview with real-time updates
- AI-powered content suggestions
- Code snippet management and Mermaid diagram editor

### Export Options
- **README.md Export**: GitHub-flavored markdown, direct commit to repository
- **Static Site Export**: Docusaurus, MkDocs, VitePress, Jekyll/GitHub Pages
- **Other Formats**: PDF documentation, DOCX export, Confluence wiki format

## Data Models

```typescript
User {
  id: string
  email: string
  githubId: string
  repositories: Repository[]
  projects: Project[]
  subscription: Subscription
}

Project {
  id: string
  userId: string
  repositoryUrl: string
  sections: Section[]
  theme: Theme
  settings: Settings
  versions: Version[]
}

Section {
  id: string
  type: SectionType
  title: string
  content: string
  order: number
  enabled: boolean
  customFields: JSON
}
```

## Development Phases

The project is structured in 4 phases:
1. **MVP** (Weeks 1-4): Core editor, basic templates, GitHub integration, README export
2. **Enhanced Editor** (Weeks 5-8): AI features, advanced templates, multiple themes, static site export
3. **Collaboration** (Weeks 9-12): Team features, version control, comments/reviews, analytics
4. **Scale** (Weeks 13-16): API development, integrations, performance optimization

## Security Considerations

- OAuth 2.0 for authentication
- Encrypted data at rest, TLS 1.3 for data in transit
- GDPR compliance requirements
- Privacy-first design principles
- Regular security audits planned