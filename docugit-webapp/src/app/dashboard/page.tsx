"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  GitBranch,
  Star,
  GitFork,
  Calendar,
  FileText,
  Globe,
  Search,
  Plus,
  Book,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  LogOut,
  FolderOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  private: boolean
  topics: string[]
  default_branch: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [manualUrl, setManualUrl] = useState("")
  const [analyzing, setAnalyzing] = useState<number | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/")
    }
  }, [session, status, router])

  // Fetch user repositories
  useEffect(() => {
    const fetchRepositories = async () => {
      if (!session?.accessToken) return

      try {
        setLoading(true)
        const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch repositories: ${response.status}`)
        }

        const repos = await response.json()
        setRepositories(repos)
      } catch (error) {
        console.error("Error fetching repositories:", error)
        setError("Failed to load repositories. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (session?.accessToken) {
      fetchRepositories()
    }
  }, [session?.accessToken])

  const handleAnalyzeRepository = async (repo: Repository) => {
    setAnalyzing(repo.id)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: repo.html_url,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze repository")
      }

      const result = await response.json()

      // Handle the result (e.g., show modal, navigate to results page, etc.)
      console.log("Analysis result:", result)
      // You can implement a results modal or navigate to a results page here

    } catch (error) {
      console.error("Error analyzing repository:", error)
      alert("Failed to analyze repository. Please try again.")
    } finally {
      setAnalyzing(null)
    }
  }

  const handleManualAnalysis = async () => {
    if (!manualUrl.trim()) return

    setAnalyzing(-1) // Use -1 for manual analysis
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: manualUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze repository")
      }

      const result = await response.json()
      console.log("Manual analysis result:", result)
      setManualUrl("")

    } catch (error) {
      console.error("Error analyzing repository:", error)
      alert("Failed to analyze repository. Please try again.")
    } finally {
      setAnalyzing(null)
    }
  }

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getLanguageColor = (language: string | null) => {
    const colors: { [key: string]: string } = {
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-500",
      Python: "bg-green-500",
      Java: "bg-orange-500",
      Go: "bg-cyan-500",
      Rust: "bg-orange-600",
      PHP: "bg-purple-500",
      Ruby: "bg-red-500",
      Swift: "bg-orange-400",
      Kotlin: "bg-purple-600",
    }
    return colors[language || ""] || "bg-gray-500"
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GitBranch className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">DocuGit</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {session.user?.image && (
                  <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-600 hover:text-gray-900 btn-hover-bounce shadow-hover"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Manual URL Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Analyze Any Repository
            </CardTitle>
            <CardDescription>
              Paste any GitHub repository URL to generate documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="https://github.com/username/repository"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleManualAnalysis}
                disabled={!manualUrl.trim() || analyzing === -1}
                className="bg-orange-500 hover:bg-orange-600 btn-hover-scale shadow-hover"
              >
                {analyzing === -1 ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator className="mb-8" />

        {/* Your Repositories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Repositories</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepositories.map((repo) => (
                <Card key={repo.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="truncate">{repo.name}</span>
                          {repo.private && (
                            <Badge variant="secondary" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {repo.description || "No description available"}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="btn-hover-bounce shadow-hover"
                      >
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Repository Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}
                            />
                            <span>{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          <span>{repo.forks_count}</span>
                        </div>
                      </div>

                      {/* Topics */}
                      {repo.topics && repo.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {repo.topics.slice(0, 3).map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {repo.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{repo.topics.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Updated Date */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {formatDate(repo.updated_at)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => router.push(`/repo/${repo.full_name}`)}
                          variant="outline"
                          className="flex-1 btn-hover-bounce shadow-hover"
                          size="sm"
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Open Repository
                        </Button>
                        <Button
                          onClick={() => handleAnalyzeRepository(repo)}
                          disabled={analyzing === repo.id}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 btn-hover-glow shadow-hover"
                          size="sm"
                        >
                          {analyzing === repo.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Book className="h-4 w-4 mr-2" />
                          )}
                          Quick Generate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredRepositories.length === 0 && (
            <div className="text-center py-12">
              <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No repositories found" : "No repositories yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search term"
                  : "Create your first repository on GitHub to get started"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}