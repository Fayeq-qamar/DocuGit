/**
 * GitHub API Fetcher - Fetches repository files without cloning
 * Uses GitHub Trees API for recursive file listing and Contents API for file contents
 */

export interface GitHubFile {
  path: string
  type: 'blob' | 'tree'
  sha: string
  size: number
  url: string
}

export interface FileWithContent extends GitHubFile {
  content: string
  language: string
}

export interface RepositoryAnalysisData {
  files: GitHubFile[]
  sourceFiles: FileWithContent[]
  packageJson?: any
  dependencies: string[]
  hasTests: boolean
}

/**
 * Fetch repository tree structure using GitHub Trees API
 */
export async function fetchRepositoryTree(
  owner: string,
  repo: string,
  branch: string = 'main',
  accessToken?: string
): Promise<GitHubFile[]> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  // First, get the branch info to get the commit SHA
  const branchUrl = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`
  const branchRes = await fetch(branchUrl, { headers })

  if (!branchRes.ok) {
    throw new Error(`Failed to fetch branch: ${branchRes.statusText}`)
  }

  const branchData = await branchRes.json()
  const commitSha = branchData.commit.sha

  // Now fetch the tree recursively
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`
  const treeRes = await fetch(treeUrl, { headers })

  if (!treeRes.ok) {
    throw new Error(`Failed to fetch tree: ${treeRes.statusText}`)
  }

  const treeData = await treeRes.json()

  return treeData.tree.map((item: any) => ({
    path: item.path,
    type: item.type,
    sha: item.sha,
    size: item.size || 0,
    url: item.url
  }))
}

/**
 * Fetch file content from GitHub
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  accessToken?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.raw+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  const res = await fetch(url, { headers })

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.statusText}`)
  }

  return await res.text()
}

/**
 * Determine file language from extension
 */
function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()

  const langMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'swift': 'swift',
    'kt': 'kotlin'
  }

  return langMap[ext || ''] || 'unknown'
}

/**
 * Filter and prioritize which source files to fetch
 * (We can't fetch all files due to API rate limits)
 */
function selectImportantFiles(files: GitHubFile[], maxFiles: number = 30): GitHubFile[] {
  const priorities = [
    // Config files (highest priority)
    /^package\.json$/,
    /^tsconfig\.json$/,
    /^next\.config\.(js|ts)$/,
    /^tailwind\.config\.(js|ts)$/,

    // Main source files
    /^src\/app\/.*\.(tsx?|jsx?)$/,
    /^src\/components\/.*\.(tsx?|jsx?)$/,
    /^src\/lib\/.*\.(tsx?|jsx?)$/,
    /^src\/pages\/.*\.(tsx?|jsx?)$/,
    /^app\/.*\.(tsx?|jsx?)$/,
    /^components\/.*\.(tsx?|jsx?)$/,
    /^lib\/.*\.(tsx?|jsx?)$/,
    /^pages\/.*\.(tsx?|jsx?)$/,

    // API routes
    /^src\/app\/api\/.*\.(tsx?|jsx?)$/,
    /^app\/api\/.*\.(tsx?|jsx?)$/,
    /^pages\/api\/.*\.(tsx?|jsx?)$/,

    // Other source files
    /\.(tsx?|jsx?|py|java|go|rs)$/
  ]

  const scored = files
    .filter(f => f.type === 'blob')
    .filter(f => !f.path.includes('node_modules'))
    .filter(f => !f.path.includes('.next'))
    .filter(f => !f.path.includes('dist'))
    .filter(f => !f.path.includes('build'))
    .map(file => {
      let score = 0
      for (let i = 0; i < priorities.length; i++) {
        if (priorities[i].test(file.path)) {
          score = priorities.length - i
          break
        }
      }
      return { file, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiles)

  return scored.map(item => item.file)
}

/**
 * Main function: Analyze repository without cloning
 */
export async function analyzeRepositoryViaAPI(
  owner: string,
  repo: string,
  branch: string = 'main',
  accessToken?: string
): Promise<RepositoryAnalysisData> {
  console.log(`📊 Fetching repository structure for ${owner}/${repo}...`)

  // Step 1: Fetch full file tree
  const files = await fetchRepositoryTree(owner, repo, branch, accessToken)
  console.log(`✅ Found ${files.length} files in repository`)

  // Step 2: Select important files to analyze
  const importantFiles = selectImportantFiles(files)
  console.log(`📝 Selected ${importantFiles.length} important files for analysis`)

  // Step 3: Fetch content for selected files (with concurrency limit)
  const sourceFiles: FileWithContent[] = []
  let packageJson: any = undefined

  const fetchPromises = importantFiles.map(async (file) => {
    try {
      const content = await fetchFileContent(owner, repo, file.path, accessToken)
      const language = getLanguageFromPath(file.path)

      // Special handling for package.json
      if (file.path === 'package.json') {
        try {
          packageJson = JSON.parse(content)
        } catch (e) {
          console.warn('Failed to parse package.json')
        }
      }

      return {
        ...file,
        content,
        language
      } as FileWithContent
    } catch (error) {
      console.warn(`Failed to fetch ${file.path}:`, error)
      return null
    }
  })

  // Fetch with concurrency control (5 at a time to avoid rate limits)
  const batchSize = 5
  for (let i = 0; i < fetchPromises.length; i += batchSize) {
    const batch = fetchPromises.slice(i, i + batchSize)
    const results = await Promise.all(batch)
    sourceFiles.push(...results.filter((f): f is FileWithContent => f !== null))
  }

  console.log(`✅ Successfully fetched ${sourceFiles.length} source files`)

  // Step 4: Extract dependencies
  const dependencies: string[] = []
  if (packageJson?.dependencies) {
    dependencies.push(...Object.keys(packageJson.dependencies))
  }
  if (packageJson?.devDependencies) {
    dependencies.push(...Object.keys(packageJson.devDependencies))
  }

  // Step 5: Check for tests
  const hasTests = files.some(f =>
    f.path.includes('test') ||
    f.path.includes('spec') ||
    f.path.includes('__tests__')
  )

  return {
    files,
    sourceFiles,
    packageJson,
    dependencies,
    hasTests
  }
}
