import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import fs from 'fs-extra'

export interface FunctionInfo {
  name: string
  params: string[]
  returnType?: string
  lineStart: number
  lineEnd: number
  complexity: number
  isAsync: boolean
  isExported: boolean
  docComment?: string
}

export interface ClassInfo {
  name: string
  methods: string[]
  properties: string[]
  extends?: string
  implements?: string[]
  lineStart: number
  lineEnd: number
  isExported: boolean
  docComment?: string
}

export interface ImportInfo {
  source: string
  specifiers: string[]
  type: 'import' | 'require'
}

export interface ExportInfo {
  name: string
  type: 'named' | 'default' | 'all'
}

export interface ParsedFile {
  path: string
  language: string
  functions: FunctionInfo[]
  classes: ClassInfo[]
  imports: ImportInfo[]
  exports: ExportInfo[]
  complexity: number
  linesOfCode: number
}

/**
 * Parse a JavaScript/TypeScript file and extract functions, classes, imports, exports
 */
export async function parseSourceFile(filePath: string, content?: string): Promise<ParsedFile | null> {
  try {
    const fileContent = content || (await fs.readFile(filePath, 'utf-8'))
    const language = getLanguageFromPath(filePath)

    if (!['javascript', 'typescript', 'jsx', 'tsx'].includes(language)) {
      return null
    }

    // Parse file into AST
    const ast = parser.parse(fileContent, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'jsx',
        'decorators-legacy',
        'classProperties',
        'dynamicImport',
        'asyncGenerators',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
    })

    const functions: FunctionInfo[] = []
    const classes: ClassInfo[] = []
    const imports: ImportInfo[] = []
    const exports: ExportInfo[] = []
    let totalComplexity = 0

    // Traverse AST and extract information
    traverse(ast, {
      // Extract function declarations and expressions
      FunctionDeclaration(path: any) {
        const func = extractFunctionInfo(path, fileContent)
        if (func) {
          functions.push(func)
          totalComplexity += func.complexity
        }
      },

      FunctionExpression(path: any) {
        const func = extractFunctionInfo(path, fileContent)
        if (func) {
          functions.push(func)
          totalComplexity += func.complexity
        }
      },

      ArrowFunctionExpression(path: any) {
        const func = extractFunctionInfo(path, fileContent)
        if (func) {
          functions.push(func)
          totalComplexity += func.complexity
        }
      },

      // Extract class declarations
      ClassDeclaration(path: any) {
        const classInfo = extractClassInfo(path, fileContent)
        if (classInfo) {
          classes.push(classInfo)
        }
      },

      // Extract imports
      ImportDeclaration(path: any) {
        const importInfo = extractImportInfo(path)
        if (importInfo) {
          imports.push(importInfo)
        }
      },

      // Extract exports
      ExportNamedDeclaration(path: any) {
        const exportInfos = extractExportInfo(path)
        exports.push(...exportInfos)
      },

      ExportDefaultDeclaration(path: any) {
        exports.push({
          name: path.node.declaration?.name || 'default',
          type: 'default',
        })
      },

      ExportAllDeclaration(path: any) {
        exports.push({
          name: '*',
          type: 'all',
        })
      },
    })

    const linesOfCode = fileContent.split('\n').length

    return {
      path: filePath,
      language,
      functions,
      classes,
      imports,
      exports,
      complexity: totalComplexity,
      linesOfCode,
    }
  } catch (error) {
    console.error(`Failed to parse ${filePath}:`, error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * Extract function information from AST node
 */
function extractFunctionInfo(path: any, fileContent: string): FunctionInfo | null {
  try {
    const node = path.node
    const name = node.id?.name || path.parent?.id?.name || 'anonymous'

    const params = node.params.map((param: any) => {
      if (param.type === 'Identifier') {
        return param.name
      } else if (param.type === 'RestElement') {
        return `...${param.argument.name}`
      } else if (param.type === 'AssignmentPattern') {
        return param.left.name
      }
      return 'unknown'
    })

    const returnType = node.returnType?.typeAnnotation?.type || undefined

    const lineStart = node.loc?.start.line || 0
    const lineEnd = node.loc?.end.line || 0

    const complexity = calculateCyclomaticComplexity(path)

    const isAsync = node.async || false
    const isExported = path.parent?.type?.includes('Export') || false

    const docComment = extractDocComment(path, fileContent)

    return {
      name,
      params,
      returnType,
      lineStart,
      lineEnd,
      complexity,
      isAsync,
      isExported,
      docComment,
    }
  } catch (error) {
    return null
  }
}

/**
 * Extract class information from AST node
 */
function extractClassInfo(path: any, fileContent: string): ClassInfo | null {
  try {
    const node = path.node
    const name = node.id?.name || 'anonymous'

    const methods: string[] = []
    const properties: string[] = []

    node.body.body.forEach((member: any) => {
      if (member.type === 'ClassMethod') {
        methods.push(member.key.name)
      } else if (member.type === 'ClassProperty') {
        properties.push(member.key.name)
      }
    })

    const extendsClass = node.superClass?.name
    const implementsInterfaces = node.implements?.map((i: any) => i.id.name)

    const lineStart = node.loc?.start.line || 0
    const lineEnd = node.loc?.end.line || 0

    const isExported = path.parent?.type?.includes('Export') || false

    const docComment = extractDocComment(path, fileContent)

    return {
      name,
      methods,
      properties,
      extends: extendsClass,
      implements: implementsInterfaces,
      lineStart,
      lineEnd,
      isExported,
      docComment,
    }
  } catch (error) {
    return null
  }
}

/**
 * Extract import information from AST node
 */
function extractImportInfo(path: any): ImportInfo | null {
  try {
    const node = path.node
    const source = node.source.value

    const specifiers = node.specifiers.map((spec: any) => {
      if (spec.type === 'ImportDefaultSpecifier') {
        return spec.local.name
      } else if (spec.type === 'ImportNamespaceSpecifier') {
        return `* as ${spec.local.name}`
      } else if (spec.type === 'ImportSpecifier') {
        return spec.imported.name
      }
      return 'unknown'
    })

    return {
      source,
      specifiers,
      type: 'import',
    }
  } catch (error) {
    return null
  }
}

/**
 * Extract export information from AST node
 */
function extractExportInfo(path: any): ExportInfo[] {
  try {
    const node = path.node
    const exportInfos: ExportInfo[] = []

    if (node.declaration) {
      // export const foo = ...
      // export function bar() {}
      if (node.declaration.id) {
        exportInfos.push({
          name: node.declaration.id.name,
          type: 'named',
        })
      } else if (node.declaration.declarations) {
        // export const { a, b } = ...
        node.declaration.declarations.forEach((decl: any) => {
          if (decl.id.name) {
            exportInfos.push({
              name: decl.id.name,
              type: 'named',
            })
          }
        })
      }
    } else if (node.specifiers) {
      // export { foo, bar }
      node.specifiers.forEach((spec: any) => {
        exportInfos.push({
          name: spec.exported.name,
          type: 'named',
        })
      })
    }

    return exportInfos
  } catch (error) {
    return []
  }
}

/**
 * Calculate cyclomatic complexity of a function
 */
function calculateCyclomaticComplexity(path: any): number {
  let complexity = 1 // Base complexity

  path.traverse({
    IfStatement() {
      complexity++
    },
    ConditionalExpression() {
      complexity++
    },
    ForStatement() {
      complexity++
    },
    ForInStatement() {
      complexity++
    },
    ForOfStatement() {
      complexity++
    },
    WhileStatement() {
      complexity++
    },
    DoWhileStatement() {
      complexity++
    },
    SwitchCase(casePath: any) {
      if (casePath.node.test) {
        // Don't count default case
        complexity++
      }
    },
    CatchClause() {
      complexity++
    },
    LogicalExpression(logicalPath: any) {
      if (logicalPath.node.operator === '&&' || logicalPath.node.operator === '||') {
        complexity++
      }
    },
  })

  return complexity
}

/**
 * Extract JSDoc/TSDoc comment
 */
function extractDocComment(path: any, fileContent: string): string | undefined {
  try {
    const comments = path.node.leadingComments
    if (!comments || comments.length === 0) return undefined

    const lastComment = comments[comments.length - 1]
    if (lastComment.type === 'CommentBlock' && lastComment.value.startsWith('*')) {
      return lastComment.value.trim()
    }

    return undefined
  } catch (error) {
    return undefined
  }
}

/**
 * Determine language from file path
 */
function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'js':
      return 'javascript'
    case 'jsx':
      return 'jsx'
    case 'ts':
      return 'typescript'
    case 'tsx':
      return 'tsx'
    case 'py':
      return 'python'
    case 'go':
      return 'go'
    case 'rs':
      return 'rust'
    case 'java':
      return 'java'
    case 'rb':
      return 'ruby'
    case 'php':
      return 'php'
    default:
      return 'unknown'
  }
}
