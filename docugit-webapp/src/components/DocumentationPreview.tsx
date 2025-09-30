'use client'

import { useState, useEffect } from 'react'
import { DocumentationSite, NavigationItem } from '@/lib/documentation-engine'
import { exportManager, ExportOptions } from '@/lib/export-manager'

interface DocumentationPreviewProps {
  documentation: DocumentationSite
  onClose: () => void
}

export default function DocumentationPreview({ documentation, onClose }: DocumentationPreviewProps) {
  const [currentPage, setCurrentPage] = useState(documentation.pages[0])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Handle navigation
  const handleNavigation = (path: string) => {
    const page = documentation.pages.find(p => p.path === path)
    if (page) {
      setCurrentPage(page)
    }
  }

  // Handle export
  const handleExport = async (format: 'markdown' | 'html') => {
    try {
      const options: ExportOptions = {
        format,
        includeAssets: true,
        theme: documentation.config.theme
      }

      const blob = await exportManager.exportDocumentation(documentation, options)
      const filename = format === 'markdown'
        ? `${documentation.repository.replace('/', '-')}-docs.md`
        : `${documentation.repository.replace('/', '-')}-docs.html`

      await exportManager.downloadFile(blob, filename)
      setShowExportMenu(false)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  // Convert markdown to HTML (simplified)
  const renderMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 text-gray-900">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 text-gray-800">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-2 text-gray-700">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```([^`]+)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/, '<p class="mb-4">$1</p>')
  }

  const getThemeClasses = () => {
    switch (documentation.config.theme) {
      case 'github':
        return 'bg-white text-gray-900'
      case 'dark':
        return 'bg-gray-900 text-gray-100'
      case 'gitbook':
        return 'bg-blue-50 text-blue-900'
      default:
        return 'bg-white text-gray-900'
    }
  }

  const getSidebarClasses = () => {
    switch (documentation.config.theme) {
      case 'github':
        return 'bg-gray-50 border-gray-200'
      case 'dark':
        return 'bg-gray-800 border-gray-700'
      case 'gitbook':
        return 'bg-blue-100 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${getThemeClasses()}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            📚 {documentation.repository} Documentation
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(`/preview/${documentation.repository}`, '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            🚀 Open in New Tab
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              📥 Export
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('markdown')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📄 Download as Markdown
                  </button>
                  <button
                    onClick={() => handleExport('html')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🌐 Download as HTML
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className={`w-64 border-r ${getSidebarClasses()} overflow-y-auto`}>
            <div className="p-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Navigation
              </h2>
              <nav className="space-y-1">
                {documentation.navigation.map((item) => (
                  <NavigationLink
                    key={item.path}
                    item={item}
                    currentPath={currentPage.path}
                    onNavigate={handleNavigation}
                    theme={documentation.config.theme}
                  />
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="text-sm text-gray-500">
                <span>{documentation.repository}</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">{currentPage.title}</span>
              </nav>
            </div>

            {/* Page Content */}
            <article
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(currentPage.content)
              }}
            />

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  Generated on {new Date(documentation.generatedAt).toLocaleString()}
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                    🤖 AI Generated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NavigationLinkProps {
  item: NavigationItem
  currentPath: string
  onNavigate: (path: string) => void
  theme: string
}

function NavigationLink({ item, currentPath, onNavigate, theme }: NavigationLinkProps) {
  const isActive = currentPath === item.path

  const getLinkClasses = () => {
    const baseClasses = "block px-3 py-2 rounded-md text-sm transition-colors cursor-pointer"

    if (isActive) {
      switch (theme) {
        case 'github':
          return `${baseClasses} bg-blue-100 text-blue-900 font-medium`
        case 'dark':
          return `${baseClasses} bg-blue-900 text-blue-100 font-medium`
        case 'gitbook':
          return `${baseClasses} bg-blue-200 text-blue-900 font-medium`
        default:
          return `${baseClasses} bg-blue-100 text-blue-900 font-medium`
      }
    } else {
      switch (theme) {
        case 'github':
          return `${baseClasses} text-gray-700 hover:bg-gray-100`
        case 'dark':
          return `${baseClasses} text-gray-300 hover:bg-gray-700`
        case 'gitbook':
          return `${baseClasses} text-blue-700 hover:bg-blue-50`
        default:
          return `${baseClasses} text-gray-700 hover:bg-gray-100`
      }
    }
  }

  return (
    <div>
      <div
        className={getLinkClasses()}
        onClick={() => onNavigate(item.path)}
      >
        {item.title}
      </div>
      {item.children && (
        <div className="ml-4 mt-1">
          {item.children.map((child) => (
            <NavigationLink
              key={child.path}
              item={child}
              currentPath={currentPath}
              onNavigate={onNavigate}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  )
}