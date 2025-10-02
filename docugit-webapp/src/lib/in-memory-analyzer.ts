/**
 * In-Memory Code Analyzer - Analyzes code using AST without file system
 * Uses @babel/parser for JavaScript/TypeScript parsing
 */

import { parse } from '@babel/parser'
import type { FileWithContent } from './github-fetcher'

export interface FunctionInfo {
  name: string
  params: string[]
  lineStart: number
  lineEnd: number
  isAsync: boolean
  isExported: boolean
  complexity: number
  docComment?: string
}

export interface ClassInfo {
  name: string
  methods: string[]
  properties: string[]
  lineStart: number
  lineEnd: number
  extends?: string
  implements?: string[]
}

export interface ComponentInfo {
  name: string
  type: 'functional' | 'class'
  props?: string[]
  hooks?: string[]
}

export interface APIEndpointInfo {
  method: string
  path: string
  file: string
  lineNumber: number
}

export interface AnalyzedFile {
  path: string
  language: string
  linesOfCode: number
  functions: FunctionInfo[]
  classes: ClassInfo[]
  imports: { source: string; specifiers: string[] }[]
  exports: { name: string; type: string }[]
  complexity: number
}

export interface AnalysisResult {
  metrics: {
    totalFiles: number
    totalFunctions: number
    totalComponents: number
    totalAPIEndpoints: number
    averageComplexity: number
  }
  dependencies: {
    totalCount: number
    production: Record<string, string>
    development: Record<string, string>
    frameworks: string[]
    uiLibraries: string[]
    databases: string[]
    all: string[]
  }
  technologies: string[]
  architecture: {
    type: string
    patterns: string[]
  }
  apiEndpoints: APIEndpointInfo[]
  components: ComponentInfo[]
  sourceFiles: AnalyzedFile[]
  fileTree: any
  configFiles: Record<string, any>
}

/**
 * Parse JavaScript/TypeScript file content using @babel/parser
 */
function parseSourceCode(content: string, filePath: string): any {
  const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx')
  const isJSX = filePath.endsWith('.jsx') || filePath.endsWith('.tsx')

  const plugins: any[] = ['decorators-legacy']

  if (isTypeScript) {
    plugins.push('typescript')
  }

  if (isJSX) {
    plugins.push('jsx')
  }

  try {
    return parse(content, {
      sourceType: 'module',
      plugins,
      errorRecovery: true
    })
  } catch (error) {
    console.warn(`Failed to parse ${filePath}:`, error)
    return null
  }
}

/**
 * Extract functions from AST
 */
function extractFunctions(ast: any): FunctionInfo[] {
  const functions: FunctionInfo[] = []

  function traverse(node: any, parent: any = null) {
    if (!node || typeof node !== 'object') return

    // Function declarations
    if (node.type === 'FunctionDeclaration' && node.id) {
      functions.push({
        name: node.id.name,
        params: node.params.map((p: any) => p.name || 'param'),
        lineStart: node.loc?.start.line || 0,
        lineEnd: node.loc?.end.line || 0,
        isAsync: node.async || false,
        isExported: parent?.type === 'ExportNamedDeclaration' || parent?.type === 'ExportDefaultDeclaration',
        complexity: 1
      })
    }

    // Arrow functions and function expressions assigned to variables
    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((decl: any) => {
        if (decl.init && (decl.init.type === 'ArrowFunctionExpression' || decl.init.type === 'FunctionExpression')) {
          functions.push({
            name: decl.id?.name || 'anonymous',
            params: decl.init.params.map((p: any) => p.name || 'param'),
            lineStart: decl.loc?.start.line || 0,
            lineEnd: decl.loc?.end.line || 0,
            isAsync: decl.init.async || false,
            isExported: parent?.type === 'ExportNamedDeclaration',
            complexity: 1
          })
        }
      })
    }

    // Traverse children
    for (const key in node) {
      if (key === 'loc' || key === 'start' || key === 'end') continue
      const child = node[key]

      if (Array.isArray(child)) {
        child.forEach(c => traverse(c, node))
      } else if (child && typeof child === 'object') {
        traverse(child, node)
      }
    }
  }

  if (ast?.program) {
    traverse(ast.program)
  }

  return functions
}

/**
 * Extract classes from AST
 */
function extractClasses(ast: any): ClassInfo[] {
  const classes: ClassInfo[] = []

  function traverse(node: any) {
    if (!node || typeof node !== 'object') return

    if (node.type === 'ClassDeclaration' && node.id) {
      const methods: string[] = []
      const properties: string[] = []

      node.body?.body?.forEach((member: any) => {
        if (member.type === 'ClassMethod') {
          methods.push(member.key?.name || 'method')
        } else if (member.type === 'ClassProperty') {
          properties.push(member.key?.name || 'property')
        }
      })

      classes.push({
        name: node.id.name,
        methods,
        properties,
        lineStart: node.loc?.start.line || 0,
        lineEnd: node.loc?.end.line || 0,
        extends: node.superClass?.name
      })
    }

    // Traverse children
    for (const key in node) {
      if (key === 'loc' || key === 'start' || key === 'end') continue
      const child = node[key]

      if (Array.isArray(child)) {
        child.forEach(c => traverse(c))
      } else if (child && typeof child === 'object') {
        traverse(child)
      }
    }
  }

  if (ast?.program) {
    traverse(ast.program)
  }

  return classes
}

/**
 * Extract React components from AST
 */
function extractComponents(ast: any, filePath: string): ComponentInfo[] {
  const components: ComponentInfo[] = []
  const functions = extractFunctions(ast)

  // Look for React components (functions that return JSX or start with capital letter)
  functions.forEach(func => {
    const isComponent = /^[A-Z]/.test(func.name)
    if (isComponent) {
      components.push({
        name: func.name,
        type: 'functional'
      })
    }
  })

  // Look for class components
  const classes = extractClasses(ast)
  classes.forEach(cls => {
    if (cls.extends === 'Component' || cls.extends === 'PureComponent' || cls.methods.includes('render')) {
      components.push({
        name: cls.name,
        type: 'class'
      })
    }
  })

  return components
}

/**
 * Detect API endpoints from file path and content
 */
function detectAPIEndpoints(file: AnalyzedFile): APIEndpointInfo[] {
  const endpoints: APIEndpointInfo[] = []

  // Next.js API routes pattern: /api/...
  if (file.path.includes('/api/') && file.path.match(/route\.(ts|js|tsx|jsx)$/)) {
    const routePath = file.path
      .replace(/.*\/api\//, '/api/')
      .replace(/\/route\.(ts|js|tsx|jsx)$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1') // Convert [id] to :id

    // Look for exported HTTP method handlers
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    file.exports.forEach(exp => {
      if (methods.includes(exp.name)) {
        endpoints.push({
          method: exp.name,
          path: routePath || '/api',
          file: file.path,
          lineNumber: 0
        })
      }
    })
  }

  return endpoints
}

/**
 * Analyze a single source file
 */
export function analyzeFile(file: FileWithContent): AnalyzedFile | null {
  // Only analyze JavaScript/TypeScript files
  if (!['javascript', 'typescript'].includes(file.language)) {
    return null
  }

  const ast = parseSourceCode(file.content, file.path)
  if (!ast) return null

  const functions = extractFunctions(ast)
  const classes = extractClasses(ast)

  // Extract imports
  const imports: { source: string; specifiers: string[] }[] = []
  ast.program?.body?.forEach((node: any) => {
    if (node.type === 'ImportDeclaration') {
      imports.push({
        source: node.source.value,
        specifiers: node.specifiers.map((s: any) => s.local?.name || 'default')
      })
    }
  })

  // Extract exports
  const exports: { name: string; type: string }[] = []
  ast.program?.body?.forEach((node: any) => {
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration?.declarations) {
        node.declaration.declarations.forEach((decl: any) => {
          exports.push({ name: decl.id?.name || 'unknown', type: 'named' })
        })
      } else if (node.declaration?.id) {
        exports.push({ name: node.declaration.id.name, type: 'named' })
      }
    } else if (node.type === 'ExportDefaultDeclaration') {
      exports.push({ name: 'default', type: 'default' })
    }
  })

  const linesOfCode = file.content.split('\n').length

  return {
    path: file.path,
    language: file.language,
    linesOfCode,
    functions,
    classes,
    imports,
    exports,
    complexity: functions.length + classes.length
  }
}

/**
 * Categorize dependencies into frameworks, UI libraries, databases, etc.
 */
function categorizeDependencies(dependencies: string[]): {
  frameworks: string[]
  uiLibraries: string[]
  databases: string[]
} {
  const frameworks: string[] = []
  const uiLibraries: string[] = []
  const databases: string[] = []

  const frameworkPatterns = ['next', 'react', 'vue', 'angular', 'svelte', 'express', 'fastify', 'nest']
  const uiPatterns = ['@radix-ui', '@headlessui', '@mui', 'antd', 'chakra-ui', 'tailwindcss', 'bootstrap']
  const dbPatterns = ['prisma', 'mongoose', 'sequelize', 'typeorm', '@supabase', 'mongodb', 'mysql', 'postgres', 'redis']

  dependencies.forEach(dep => {
    const lowerDep = dep.toLowerCase()

    if (frameworkPatterns.some(p => lowerDep.includes(p))) {
      frameworks.push(dep)
    }

    if (uiPatterns.some(p => lowerDep.includes(p))) {
      uiLibraries.push(dep)
    }

    if (dbPatterns.some(p => lowerDep.includes(p))) {
      databases.push(dep)
    }
  })

  return { frameworks, uiLibraries, databases }
}

/**
 * Main function: Analyze repository data from GitHub API
 */
export function analyzeRepositoryData(
  sourceFiles: FileWithContent[],
  packageJson?: any
): AnalysisResult {
  console.log(`🔍 Analyzing ${sourceFiles.length} source files...`)

  // Analyze each file
  const analyzedFiles: AnalyzedFile[] = []
  const components: ComponentInfo[] = []
  const apiEndpoints: APIEndpointInfo[] = []

  sourceFiles.forEach(file => {
    const analyzed = analyzeFile(file)
    if (analyzed) {
      analyzedFiles.push(analyzed)

      // Extract components
      const ast = parseSourceCode(file.content, file.path)
      if (ast) {
        const fileComponents = extractComponents(ast, file.path)
        components.push(...fileComponents)
      }

      // Extract API endpoints
      const endpoints = detectAPIEndpoints(analyzed)
      apiEndpoints.push(...endpoints)
    }
  })

  // Calculate metrics
  const totalFunctions = analyzedFiles.reduce((sum, f) => sum + f.functions.length, 0)
  const totalComplexity = analyzedFiles.reduce((sum, f) => sum + f.complexity, 0)
  const averageComplexity = analyzedFiles.length > 0 ? totalComplexity / analyzedFiles.length : 0

  // Process dependencies
  const allDeps: string[] = []
  const prodDeps: Record<string, string> = packageJson?.dependencies || {}
  const devDeps: Record<string, string> = packageJson?.devDependencies || {}

  allDeps.push(...Object.keys(prodDeps), ...Object.keys(devDeps))

  const categorized = categorizeDependencies(allDeps)

  // Detect technologies
  const technologies = new Set<string>()
  analyzedFiles.forEach(f => {
    if (f.path.endsWith('.ts') || f.path.endsWith('.tsx')) technologies.add('TypeScript')
    if (f.path.endsWith('.js') || f.path.endsWith('.jsx')) technologies.add('JavaScript')
  })
  if (allDeps.some(d => d.includes('react'))) technologies.add('React')
  if (allDeps.some(d => d.includes('next'))) technologies.add('Next.js')
  if (allDeps.some(d => d.includes('tailwind'))) technologies.add('Tailwind CSS')

  return {
    metrics: {
      totalFiles: analyzedFiles.length,
      totalFunctions,
      totalComponents: components.length,
      totalAPIEndpoints: apiEndpoints.length,
      averageComplexity
    },
    dependencies: {
      totalCount: allDeps.length,
      production: prodDeps,
      development: devDeps,
      frameworks: categorized.frameworks,
      uiLibraries: categorized.uiLibraries,
      databases: categorized.databases,
      all: allDeps
    },
    technologies: Array.from(technologies),
    architecture: {
      type: allDeps.some(d => d.includes('next')) ? 'Next.js App' : 'Web Application',
      patterns: []
    },
    apiEndpoints,
    components,
    sourceFiles: analyzedFiles,
    fileTree: {},
    configFiles: packageJson ? { 'package.json': packageJson } : {}
  }
}
