"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Star, GitFork, Eye, Clock, FileText, Globe, Loader2, CheckCircle, AlertCircle, Folder, FolderOpen, File, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string
  updated_at: string
  topics: string[]
  default_branch: string
}

interface AnalysisFile {
  path: string
  status: 'pending' | 'analyzing' | 'completed' | 'error'
  type: string
  size: number
}

interface FileTreeItem {
  path: string
  name: string
  type: 'blob' | 'tree'
  size?: number
  children?: FileTreeItem[]
  expanded?: boolean
}

export default function RepositoryPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisType, setAnalysisType] = useState<'readme' | 'docs' | null>(null)
  const [analysisFiles, setAnalysisFiles] = useState<AnalysisFile[]>([])
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState<string>("")
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([])
  const [loadingFiles, setLoadingFiles] = useState(true)

  // Extract owner and repo from slug
  const slug = params.slug as string[]
  const owner = slug?.[0]
  const repo = slug?.[1]

  useEffect(() => {
    if (owner && repo && session?.accessToken) {
      fetchRepository()
      fetchFileTree()
    }
  }, [owner, repo, session])

  const fetchRepository = async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${session?.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (response.ok) {
        const repoData = await response.json()
        setRepository(repoData)
      }
    } catch (error) {
      console.error('Error fetching repository:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFileTree = async () => {
    setLoadingFiles(true)
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repository?.default_branch || 'main'}?recursive=1`, {
        headers: {
          'Authorization': `token ${session?.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const tree = buildFileTree(data.tree)
        setFileTree(tree)
      }
    } catch (error) {
      console.error('Error fetching file tree:', error)
    } finally {
      setLoadingFiles(false)
    }
  }

  const buildFileTree = (items: any[]): FileTreeItem[] => {
    const tree: FileTreeItem[] = []
    const pathMap: { [key: string]: FileTreeItem } = {}

    // Sort items so directories come before files
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'tree' ? -1 : 1
      }
      return a.path.localeCompare(b.path)
    })

    items.forEach(item => {
      const pathParts = item.path.split('/')
      const fileName = pathParts[pathParts.length - 1]

      const fileItem: FileTreeItem = {
        path: item.path,
        name: fileName,
        type: item.type,
        size: item.size,
        children: item.type === 'tree' ? [] : undefined,
        expanded: false
      }

      pathMap[item.path] = fileItem

      if (pathParts.length === 1) {
        // Root level item
        tree.push(fileItem)
      } else {
        // Find parent directory
        const parentPath = pathParts.slice(0, -1).join('/')
        const parent = pathMap[parentPath]

        if (parent && parent.children) {
          parent.children.push(fileItem)
        }
      }
    })

    return tree
  }

  const toggleFolder = (path: string) => {
    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.map(item => {
        if (item.path === path) {
          return { ...item, expanded: !item.expanded }
        }
        if (item.children) {
          return { ...item, children: updateTree(item.children) }
        }
        return item
      })
    }
    setFileTree(updateTree(fileTree))
  }

  const getFileIcon = (fileName: string, isFolder: boolean, isExpanded: boolean = false) => {
    if (isFolder) {
      return isExpanded ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-blue-500" />
    }

    const extension = fileName.split('.').pop()?.toLowerCase()

    // You can extend this with more specific file type icons
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <File className="h-4 w-4 text-yellow-500" />
      case 'json':
        return <File className="h-4 w-4 text-orange-500" />
      case 'md':
        return <File className="h-4 w-4 text-blue-600" />
      case 'css':
      case 'scss':
        return <File className="h-4 w-4 text-pink-500" />
      case 'html':
        return <File className="h-4 w-4 text-red-500" />
      case 'py':
        return <File className="h-4 w-4 text-green-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const fetchRepositoryFiles = async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repository?.default_branch}?recursive=1`, {
        headers: {
          'Authorization': `token ${session?.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const files = data.tree
          .filter((item: any) => item.type === 'blob')
          .map((file: any) => ({
            path: file.path,
            status: 'pending' as const,
            type: file.path.split('.').pop() || 'unknown',
            size: file.size || 0
          }))

        setAnalysisFiles(files)
        return files
      }
    } catch (error) {
      console.error('Error fetching repository files:', error)
    }
    return []
  }

  const analyzeRepositoryWithAI = async (files: AnalysisFile[], type: 'readme' | 'docs') => {
    setAnalyzing(true)
    setAnalysisType(type)
    setProgress(0)

    try {
      // Phase 1: Analyze files (visual feedback)
      setCurrentFile("Scanning repository structure...")
      setProgress(20)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Phase 2: Fetch key file contents
      setCurrentFile("Reading key files...")
      const keyFiles = await fetchKeyFileContents(files)
      setProgress(40)

      // Phase 3: Generate AI content
      const contentTypeMessage = type === 'docs' ? "Generating comprehensive documentation with AI..." : "Generating professional README with AI..."
      setCurrentFile(contentTypeMessage)
      setProgress(60)

      const repositoryData = {
        owner,
        repo,
        fullName: repository?.full_name,
        description: repository?.description,
        language: repository?.language,
        topics: repository?.topics,
        stars: repository?.stargazers_count,
        forks: repository?.forks_count,
        analysisType: type,
        files: files
      }

      // Call appropriate AI API based on type
      const apiEndpoint = type === 'docs' ? '/api/generate-documentation' : '/api/generate-readme'
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-token': session?.accessToken || '',
        },
        body: JSON.stringify({
          repositoryData,
          fileContents: keyFiles
        })
      })

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`)
      }

      const aiResult = await response.json()

      if (!aiResult.success) {
        const errorMessage = type === 'docs' ? 'Failed to generate documentation' : 'Failed to generate README'
        throw new Error(aiResult.error || errorMessage)
      }

      setProgress(90)
      setCurrentFile("Finalizing...")

      // Store the AI-generated content for the editor
      const editorData = {
        ...repositoryData,
        aiGenerated: true,
        generatedSections: aiResult.sections,
        generatedContent: aiResult.content
      }

      console.log('🔥 Storing AI data in localStorage:', {
        aiGenerated: editorData.aiGenerated,
        sectionsCount: aiResult.sections?.length,
        hasContent: !!aiResult.content
      })

      localStorage.setItem('repositoryData', JSON.stringify(editorData))

      setProgress(100)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Navigate to editor
      router.push('/editor')

    } catch (error) {
      console.error('AI analysis error:', error)
      setAnalyzing(false)
      // Fallback to template-based generation
      alert(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Using template fallback.`)

      // Fallback to original template system
      const repoData = {
        owner,
        repo,
        fullName: repository?.full_name,
        description: repository?.description,
        language: repository?.language,
        topics: repository?.topics,
        stars: repository?.stargazers_count,
        forks: repository?.forks_count,
        analysisType: type,
        files: files
      }
      localStorage.setItem('repositoryData', JSON.stringify(repoData))
      router.push('/editor')
    }
  }

  // Helper function to fetch key file contents for AI analysis
  const fetchKeyFileContents = async (files: AnalysisFile[]) => {
    const keyFilePatterns = [
      'package.json',
      'requirements.txt',
      'Cargo.toml',
      'go.mod',
      'README.md',
      'main.js',
      'index.js',
      'main.py',
      'main.go',
      'main.rs',
      'Dockerfile'
    ]

    const keyFiles: { [filename: string]: string } = {}

    for (const pattern of keyFilePatterns) {
      const file = files.find(f =>
        f.path === pattern ||
        f.path.endsWith(`/${pattern}`) ||
        f.path.toLowerCase().includes(pattern.toLowerCase())
      )

      if (file && file.size < 10000) { // Only fetch files under 10KB
        try {
          const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, {
            headers: {
              'Authorization': `token ${session?.accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.content && data.encoding === 'base64') {
              const content = atob(data.content)
              keyFiles[file.path] = content.substring(0, 2000) // Limit content size
            }
          }
        } catch (error) {
          console.error(`Error fetching ${file.path}:`, error)
        }
      }
    }

    return keyFiles
  }

  const handleGenerateReadme = async () => {
    const files = await fetchRepositoryFiles()
    if (files.length > 0) {
      await analyzeRepositoryWithAI(files, 'readme')
    }
  }

  const handleGenerateDocs = async () => {
    const files = await fetchRepositoryFiles()
    if (files.length > 0) {
      await analyzeRepositoryWithAI(files, 'docs')
    }
  }

  const renderFileTree = (items: FileTreeItem[], depth: number = 0): JSX.Element[] => {
    return items.map((item) => (
      <div key={item.path}>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer text-sm ${
            depth > 0 ? `ml-${depth * 4}` : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => item.type === 'tree' ? toggleFolder(item.path) : null}
        >
          {item.type === 'tree' && (
            <span className="flex-shrink-0">
              {item.expanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </span>
          )}
          {item.type === 'blob' && <span className="w-3" />}
          <span className="flex-shrink-0">
            {getFileIcon(item.name, item.type === 'tree', item.expanded)}
          </span>
          <span className="truncate text-gray-700">{item.name}</span>
          {item.type === 'blob' && item.size && (
            <span className="text-xs text-gray-400 ml-auto">
              {formatFileSize(item.size)}
            </span>
          )}
        </div>
        {item.type === 'tree' && item.expanded && item.children && (
          <div>
            {renderFileTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzing':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-300" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Repository not found</h2>
          <p className="text-gray-600 mb-4">The repository you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/dashboard')} className="btn-hover-bounce shadow-hover">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold text-gray-900">{repository.full_name}</h1>
              <p className="text-gray-600">{repository.description}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Repository Contents */}
        <div className="w-1/2 border-r bg-white overflow-y-auto">
          <div className="p-4">
            {/* Repository Header */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4 mb-2">
                <Badge variant="secondary">{repository.language}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4" />
                  {repository.stargazers_count}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <GitFork className="h-4 w-4" />
                  {repository.forks_count}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="btn-hover-bounce shadow-hover"
              >
                <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>

            {/* File Tree */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Repository Files
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingFiles ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                    <span className="ml-2 text-sm text-gray-600">Loading files...</span>
                  </div>
                ) : fileTree.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {renderFileTree(fileTree)}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No files found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Progress */}
            {analyzing && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing Repository
                  </CardTitle>
                  <CardDescription>
                    Generating {analysisType === 'readme' ? 'README' : 'Documentation'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {currentFile && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Currently analyzing:</p>
                      <p className="text-sm text-blue-700 font-mono">{currentFile}</p>
                    </div>
                  )}

                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {analysisFiles.map((file) => (
                      <div key={file.path} className="flex items-center gap-2 text-sm">
                        {getStatusIcon(file.status)}
                        <span className={`font-mono ${file.status === 'analyzing' ? 'text-blue-600 font-medium' : ''}`}>
                          {file.path}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Sidebar - Actions */}
        <div className="w-1/2 bg-gray-50 p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Documentation</CardTitle>
                <CardDescription>
                  Choose what type of documentation you'd like to generate for this repository
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleGenerateReadme}
                  disabled={analyzing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white btn-hover-glow shadow-hover"
                  size="lg"
                >
                  {analyzing && analysisType === 'readme' ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <FileText className="h-5 w-5 mr-2" />
                  )}
                  Generate README
                </Button>

                <Button
                  onClick={handleGenerateDocs}
                  disabled={analyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white btn-hover-glow shadow-hover"
                  size="lg"
                >
                  {analyzing && analysisType === 'docs' ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Globe className="h-5 w-5 mr-2" />
                  )}
                  Generate Documentation Site
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-medium">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Repository Analysis</p>
                    <p>We'll scan all files to understand your project structure and dependencies.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-medium">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Content Generation</p>
                    <p>AI will generate comprehensive documentation based on your code and structure.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-medium">3</div>
                  <div>
                    <p className="font-medium text-gray-900">Review & Edit</p>
                    <p>You'll be taken to the editor where you can review and customize the generated content.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}