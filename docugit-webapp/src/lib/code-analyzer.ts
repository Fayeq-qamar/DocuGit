import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'
import { parseSourceFile, ParsedFile } from './ast-parser'

export interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  children?: FileTreeNode[]
  language?: string
  linesOfCode?: number
}

export interface RepositoryAnalysis {
  fileTree: FileTreeNode
  sourceFiles: ParsedFile[]
  apiEndpoints: APIEndpoint[]
  components: ComponentInfo[]
  configFiles: Record<string, any>
  dependencies: DependencyInfo
  architecture: ArchitectureInfo
  metrics: RepositoryMetrics
}

export interface APIEndpoint {
  method: string
  path: string
  file: string
  handler: string
  lineNumber: number
}

export interface ComponentInfo {
  name: string
  file: string
  type: 'page' | 'component' | 'layout'
  props?: string[]
  exports: string[]
}

export interface DependencyInfo {
  production: Record<string, string>
  development: Record<string, string>
  totalCount: number
  frameworks: string[]
  uiLibraries: string[]
  databases: string[]
}

export interface ArchitectureInfo {
  type: string
  framework: string
  language: string
  database?: string
  authentication?: string
  styling?: string
  testing?: string
}

export interface RepositoryMetrics {
  totalFiles: number
  totalDirectories: number
  totalLines: number
  totalFunctions: number
  totalClasses: number
  totalComponents: number
  totalAPIEndpoints: number
  averageComplexity: number
  languageBreakdown: Record<string, number>
}

/**
 * Analyze an entire repository and extract comprehensive information
 */
export async function analyzeRepository(
  repoPath: string,
  onProgress?: (message: string, percentage: number) => void
): Promise<RepositoryAnalysis> {
  console.log(`📊 Starting deep repository analysis: ${repoPath}`)

  // Step 1: Build file tree (10%)
  onProgress?.('Building file tree...', 10)
  const fileTree = await buildFileTree(repoPath)

  // Step 2: Find all source files (20%)
  onProgress?.('Scanning source files...', 20)
  const allFiles = await findSourceFiles(repoPath)

  // Step 3: Parse source files (30-60%)
  onProgress?.('Parsing source code...', 30)
  const sourceFiles: ParsedFile[] = []
  let parsedCount = 0

  for (const file of allFiles.slice(0, 100)) {
    // Limit to 100 files for performance
    try {
      const parsed = await parseSourceFile(file)
      if (parsed) {
        sourceFiles.push(parsed)
      }
      parsedCount++
      const progress = 30 + (parsedCount / Math.min(allFiles.length, 100)) * 30
      onProgress?.(`Parsing ${path.basename(file)}...`, progress)
    } catch (error) {
      console.error(`Failed to parse ${file}:`, error)
    }
  }

  // Step 4: Analyze API endpoints (65%)
  onProgress?.('Analyzing API endpoints...', 65)
  const apiEndpoints = await findAPIEndpoints(repoPath, sourceFiles)

  // Step 5: Analyze components (70%)
  onProgress?.('Analyzing components...', 70)
  const components = await findComponents(repoPath, sourceFiles)

  // Step 6: Read config files (75%)
  onProgress?.('Reading configuration files...', 75)
  const configFiles = await readConfigFiles(repoPath)

  // Step 7: Analyze dependencies (80%)
  onProgress?.('Analyzing dependencies...', 80)
  const dependencies = await analyzeDependencies(configFiles)

  // Step 8: Detect architecture (85%)
  onProgress?.('Detecting architecture...', 85)
  const architecture = await detectArchitecture(repoPath, configFiles, dependencies)

  // Step 9: Calculate metrics (95%)
  onProgress?.('Calculating metrics...', 95)
  const metrics = calculateMetrics(fileTree, sourceFiles, apiEndpoints, components)

  onProgress?.('Analysis complete!', 100)

  return {
    fileTree,
    sourceFiles,
    apiEndpoints,
    components,
    configFiles,
    dependencies,
    architecture,
    metrics,
  }
}

/**
 * Build complete file tree structure
 */
async function buildFileTree(rootPath: string): Promise<FileTreeNode> {
  const stats = await fs.stat(rootPath)
  const name = path.basename(rootPath)

  if (stats.isFile()) {
    return {
      name,
      path: rootPath,
      type: 'file',
      size: stats.size,
    }
  }

  const children: FileTreeNode[] = []
  const items = await fs.readdir(rootPath)

  for (const item of items) {
    // Skip node_modules, .git, .next, etc.
    if (shouldSkipDirectory(item)) continue

    const itemPath = path.join(rootPath, item)
    try {
      const child = await buildFileTree(itemPath)
      children.push(child)
    } catch (error) {
      // Skip files we can't read
      continue
    }
  }

  return {
    name,
    path: rootPath,
    type: 'directory',
    children,
  }
}

/**
 * Find all source files in repository
 */
async function findSourceFiles(repoPath: string): Promise<string[]> {
  const patterns = [
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx',
    '**/*.py',
    '**/*.go',
    '**/*.rs',
    '**/*.java',
  ]

  const ignore = [
    '**/node_modules/**',
    '**/.git/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.cache/**',
  ]

  const files: string[] = []

  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: repoPath,
      ignore,
      absolute: true,
    })
    files.push(...matches)
  }

  return files
}

/**
 * Find API endpoints in Next.js/Express apps
 */
async function findAPIEndpoints(repoPath: string, sourceFiles: ParsedFile[]): Promise<APIEndpoint[]> {
  const endpoints: APIEndpoint[] = []

  // Next.js API routes: app/api/**/route.ts or pages/api/**/*.ts
  const apiFiles = sourceFiles.filter(
    (file) => file.path.includes('/api/') && (file.path.includes('route.') || file.path.includes('pages/api'))
  )

  for (const file of apiFiles) {
    // Extract HTTP methods (GET, POST, PUT, DELETE, PATCH)
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

    for (const method of methods) {
      const methodFunc = file.functions.find((f) => f.name === method || f.name.toLowerCase() === method.toLowerCase())

      if (methodFunc) {
        const routePath = extractRoutePathFromFile(file.path, repoPath)

        endpoints.push({
          method,
          path: routePath,
          file: file.path,
          handler: methodFunc.name,
          lineNumber: methodFunc.lineStart,
        })
      }
    }
  }

  return endpoints
}

/**
 * Extract route path from file path (Next.js convention)
 */
function extractRoutePathFromFile(filePath: string, repoPath: string): string {
  const relativePath = path.relative(repoPath, filePath)

  // app/api/users/[id]/route.ts -> /api/users/[id]
  // pages/api/auth/signin.ts -> /api/auth/signin

  let routePath = relativePath
    .replace(/^(app|pages)\//, '/')
    .replace(/\/route\.(ts|tsx|js|jsx)$/, '')
    .replace(/\.(ts|tsx|js|jsx)$/, '')
    .replace(/\/index$/, '')

  return routePath
}

/**
 * Find React/Next.js components
 */
async function findComponents(repoPath: string, sourceFiles: ParsedFile[]): Promise<ComponentInfo[]> {
  const components: ComponentInfo[] = []

  const componentFiles = sourceFiles.filter(
    (file) =>
      (file.path.includes('/components/') || file.path.includes('/app/')) &&
      (file.language === 'tsx' || file.language === 'jsx')
  )

  for (const file of componentFiles) {
    // Find default export (usually the component)
    const defaultExport = file.exports.find((e) => e.type === 'default')
    const componentName = defaultExport?.name || path.basename(file.path, path.extname(file.path))

    const type = file.path.includes('/app/') && file.path.includes('page.')
      ? 'page'
      : file.path.includes('layout.')
      ? 'layout'
      : 'component'

    components.push({
      name: componentName,
      file: file.path,
      type,
      exports: file.exports.map((e) => e.name),
    })
  }

  return components
}

/**
 * Read important configuration files
 */
async function readConfigFiles(repoPath: string): Promise<Record<string, any>> {
  const configs: Record<string, any> = {}

  const configFilePaths = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'next.config.ts',
    'tailwind.config.js',
    'tailwind.config.ts',
    '.env.example',
    'docker-compose.yml',
    'Dockerfile',
    'prisma/schema.prisma',
  ]

  for (const configFile of configFilePaths) {
    const fullPath = path.join(repoPath, configFile)

    try {
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf-8')

        if (configFile.endsWith('.json')) {
          configs[configFile] = JSON.parse(content)
        } else {
          configs[configFile] = content
        }
      }
    } catch (error) {
      // Skip files we can't read
      continue
    }
  }

  return configs
}

/**
 * Analyze dependencies from package.json
 */
async function analyzeDependencies(configFiles: Record<string, any>): Promise<DependencyInfo> {
  const packageJson = configFiles['package.json']

  if (!packageJson) {
    return {
      production: {},
      development: {},
      totalCount: 0,
      frameworks: [],
      uiLibraries: [],
      databases: [],
    }
  }

  const production = packageJson.dependencies || {}
  const development = packageJson.devDependencies || {}

  const frameworks: string[] = []
  const uiLibraries: string[] = []
  const databases: string[] = []

  const allDeps = { ...production, ...development }

  // Detect frameworks
  if (allDeps.next) frameworks.push('Next.js')
  if (allDeps.react) frameworks.push('React')
  if (allDeps.vue) frameworks.push('Vue')
  if (allDeps.express) frameworks.push('Express')
  if (allDeps.fastify) frameworks.push('Fastify')

  // Detect UI libraries
  if (allDeps['tailwindcss']) uiLibraries.push('Tailwind CSS')
  if (allDeps['@radix-ui/react-slot']) uiLibraries.push('Radix UI')
  if (allDeps['framer-motion']) uiLibraries.push('Framer Motion')
  if (allDeps['@mui/material']) uiLibraries.push('Material-UI')

  // Detect databases
  if (allDeps['@prisma/client']) databases.push('Prisma')
  if (allDeps['@supabase/supabase-js']) databases.push('Supabase')
  if (allDeps.mongoose) databases.push('MongoDB')
  if (allDeps.pg) databases.push('PostgreSQL')

  return {
    production,
    development,
    totalCount: Object.keys(allDeps).length,
    frameworks,
    uiLibraries,
    databases,
  }
}

/**
 * Detect project architecture and tech stack
 */
async function detectArchitecture(
  repoPath: string,
  configFiles: Record<string, any>,
  dependencies: DependencyInfo
): Promise<ArchitectureInfo> {
  const packageJson = configFiles['package.json']

  // Detect framework
  let framework = 'Unknown'
  if (dependencies.frameworks.includes('Next.js')) framework = 'Next.js'
  else if (dependencies.frameworks.includes('React')) framework = 'React'
  else if (dependencies.frameworks.includes('Express')) framework = 'Express'

  // Detect language
  const language = configFiles['tsconfig.json'] ? 'TypeScript' : 'JavaScript'

  // Detect database
  const database = dependencies.databases[0] || undefined

  // Detect authentication
  let authentication: string | undefined
  if (packageJson?.dependencies?.['next-auth']) authentication = 'NextAuth'
  if (packageJson?.dependencies?.['@supabase/auth-helpers-nextjs']) authentication = 'Supabase Auth'

  // Detect styling
  let styling: string | undefined
  if (dependencies.uiLibraries.includes('Tailwind CSS')) styling = 'Tailwind CSS'

  // Detect testing
  let testing: string | undefined
  if (packageJson?.devDependencies?.jest) testing = 'Jest'
  if (packageJson?.devDependencies?.vitest) testing = 'Vitest'

  return {
    type: framework.toLowerCase().replace(/\s+/g, '-'),
    framework,
    language,
    database,
    authentication,
    styling,
    testing,
  }
}

/**
 * Calculate repository metrics
 */
function calculateMetrics(
  fileTree: FileTreeNode,
  sourceFiles: ParsedFile[],
  apiEndpoints: APIEndpoint[],
  components: ComponentInfo[]
): RepositoryMetrics {
  let totalFiles = 0
  let totalDirectories = 0

  function countNodes(node: FileTreeNode) {
    if (node.type === 'file') {
      totalFiles++
    } else {
      totalDirectories++
      node.children?.forEach(countNodes)
    }
  }

  countNodes(fileTree)

  const totalLines = sourceFiles.reduce((sum, file) => sum + file.linesOfCode, 0)
  const totalFunctions = sourceFiles.reduce((sum, file) => sum + file.functions.length, 0)
  const totalClasses = sourceFiles.reduce((sum, file) => sum + file.classes.length, 0)

  const totalComplexity = sourceFiles.reduce((sum, file) => sum + file.complexity, 0)
  const averageComplexity = totalComplexity / Math.max(sourceFiles.length, 1)

  const languageBreakdown: Record<string, number> = {}
  sourceFiles.forEach((file) => {
    languageBreakdown[file.language] = (languageBreakdown[file.language] || 0) + 1
  })

  return {
    totalFiles,
    totalDirectories,
    totalLines,
    totalFunctions,
    totalClasses,
    totalComponents: components.length,
    totalAPIEndpoints: apiEndpoints.length,
    averageComplexity: Math.round(averageComplexity * 10) / 10,
    languageBreakdown,
  }
}

/**
 * Check if directory should be skipped
 */
function shouldSkipDirectory(name: string): boolean {
  const skipList = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'coverage',
    '.cache',
    '.vercel',
    '.turbo',
    '__pycache__',
    '.pytest_cache',
    'vendor',
    'target',
  ]

  return skipList.includes(name) || name.startsWith('.')
}
