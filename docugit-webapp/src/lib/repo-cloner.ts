import simpleGit, { SimpleGit } from 'simple-git'
import fs from 'fs-extra'
import path from 'path'
import { randomBytes } from 'crypto'

export interface CloneOptions {
  repoUrl: string
  accessToken?: string
  branch?: string
}

export interface ClonedRepository {
  localPath: string
  repoId: string
  cleanup: () => Promise<void>
}

/**
 * Clone a GitHub repository to a temporary local directory
 * Supports both public and private repositories via access token
 */
export async function cloneRepository(options: CloneOptions): Promise<ClonedRepository> {
  const { repoUrl, accessToken, branch = 'main' } = options

  // Generate unique directory ID
  const repoId = randomBytes(16).toString('hex')
  const tmpDir = path.join('/tmp', `docugit-${repoId}`)

  // Ensure tmp directory exists
  await fs.ensureDir('/tmp')

  // Build authenticated clone URL if token provided
  let cloneUrl = repoUrl
  if (accessToken) {
    // Transform https://github.com/user/repo to https://TOKEN@github.com/user/repo
    cloneUrl = repoUrl.replace('https://github.com', `https://${accessToken}@github.com`)
  }

  console.log(`🔄 Cloning repository to ${tmpDir}...`)
  const startTime = Date.now()

  const git: SimpleGit = simpleGit()

  try {
    // Clone the repository with depth 1 (no history) for speed
    await git.clone(cloneUrl, tmpDir, {
      '--depth': 1,
      '--single-branch': null,
      '--branch': branch,
    })

    const duration = Date.now() - startTime
    console.log(`✅ Repository cloned successfully in ${duration}ms`)

    // Get repository size
    const stats = await getDirectorySize(tmpDir)
    console.log(`📦 Repository size: ${formatBytes(stats.size)}`)

    // Cleanup function
    const cleanup = async () => {
      try {
        console.log(`🗑️  Cleaning up ${tmpDir}...`)
        await fs.remove(tmpDir)
        console.log(`✅ Cleanup complete`)
      } catch (error) {
        console.error(`❌ Cleanup failed:`, error)
      }
    }

    return {
      localPath: tmpDir,
      repoId,
      cleanup,
    }
  } catch (error) {
    // Cleanup on error
    try {
      await fs.remove(tmpDir)
    } catch (cleanupError) {
      console.error('Cleanup after error failed:', cleanupError)
    }

    throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get total size of a directory
 */
async function getDirectorySize(dirPath: string): Promise<{ size: number; files: number }> {
  let totalSize = 0
  let totalFiles = 0

  async function traverse(currentPath: string) {
    const items = await fs.readdir(currentPath)

    for (const item of items) {
      const itemPath = path.join(currentPath, item)
      const stats = await fs.stat(itemPath)

      if (stats.isDirectory()) {
        // Skip .git directory for size calculation
        if (item !== '.git') {
          await traverse(itemPath)
        }
      } else {
        totalSize += stats.size
        totalFiles++
      }
    }
  }

  await traverse(dirPath)

  return { size: totalSize, files: totalFiles }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate repository URL
 */
export function isValidGitHubUrl(url: string): boolean {
  const pattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/
  return pattern.test(url.replace(/\.git$/, ''))
}

/**
 * Extract owner and repo name from GitHub URL
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) return null

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  }
}
