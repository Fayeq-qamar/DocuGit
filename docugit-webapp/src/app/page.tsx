"use client"

import { useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  GitBranch,
  Sparkles,
  FileCode2,
  Globe,
  Bolt,
  Users,
  Brain,
  Workflow,
  Palette,
  Rocket,
  ArrowRight,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TextReveal } from "@/components/animated/text-reveal"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (status === "loading") return
    if (session) {
      router.push("/dashboard")
    }
  }, [session, status, router])

  // Show loading state while redirecting authenticated users
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-orange-50/20"></div>


      {/* Navigation Bar */}
      <nav className="relative z-50 sticky top-0">
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"></div>
        <div className="relative container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <GitBranch className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                DocuGit
              </h1>
              <p className="text-sm text-gray-600 -mt-1">AI Documentation Generator</p>
            </div>
          </div>

          {/* Navigation Links with GitHub Icons */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="relative group flex items-center gap-2">
              <div className="absolute inset-0 -m-2 bg-white/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm -z-10"></div>
              <GitBranch className="h-4 w-4 text-orange-500 relative z-10" />
              <span className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors relative z-10">Features</span>
            </a>
            <a href="#examples" className="relative group flex items-center gap-2">
              <div className="absolute inset-0 -m-2 bg-white/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm -z-10"></div>
              <FileCode2 className="h-4 w-4 text-green-500 relative z-10" />
              <span className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors relative z-10">Examples</span>
            </a>
            <a href="#pricing" className="relative group flex items-center gap-2">
              <div className="absolute inset-0 -m-2 bg-white/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm -z-10"></div>
              <Sparkles className="h-4 w-4 text-purple-500 relative z-10" />
              <span className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors relative z-10">Pricing</span>
            </a>
            <a href="#docs" className="relative group flex items-center gap-2">
              <div className="absolute inset-0 -m-2 bg-white/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm -z-10"></div>
              <Globe className="h-4 w-4 text-blue-500 relative z-10" />
              <span className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors relative z-10">Docs</span>
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200">
              Beta
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-gray-50 text-gray-700 btn-hover-bounce shadow-hover"
              onClick={() => signIn('github')}
            >
              Sign In with GitHub
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Using Rule of Thirds Layout */}
      <main className="relative z-10">
        {/* Subtle GitHub Background Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 transform rotate-12">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute top-32 right-20 transform -rotate-6">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.25 16.25V11.75L12 9.75L14.75 11.75V16.25H9.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.5 2.5L18.5 6.5V21.5H5.5V6.5L9.5 2.5H14.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="absolute bottom-32 left-20 transform rotate-45">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L4 9V21H20V9L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="absolute top-1/2 right-10 transform -rotate-12">
            <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 2V8H2V2H8ZM8 10V16H2V10H8ZM8 18V24H2V18H8Z" />
              <path d="M14 2V8H22V2H14ZM14 10V16H22V10H14ZM14 18V24H22V18H14Z" />
            </svg>
          </div>
          <div className="absolute bottom-20 right-32 transform rotate-90">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16V8C21 6.9 20.1 6 19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16ZM5 8H19V16H5V8Z"/>
            </svg>
          </div>
        </div>

        <section className="min-h-screen flex items-center py-20 relative">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-12 items-center min-h-[80vh]">

            {/* Left Section - 3/5 (Following Golden Ratio) */}
            <div className="lg:col-span-3 space-y-8">
              <TextReveal delay={0.2}>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    AI-Powered Documentation
                  </div>

                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                    Stop Writing
                    <span className="block bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent mt-2">
                      Documentation
                    </span>
                    <span className="block text-4xl md:text-5xl lg:text-6xl text-gray-700 font-bold mt-2">
                      From Scratch
                    </span>
                  </h1>
                </div>
              </TextReveal>

              <TextReveal delay={0.4}>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                  <span className="text-red-500 font-semibold underline decoration-red-200">No more staring</span> at blank README files.
                  <br />
                  <span className="text-green-600 font-semibold underline decoration-green-200">Generate professional documentation</span> in <span className="font-bold text-green-600">30 seconds</span> with AI.
                </p>
              </TextReveal>

              <TextReveal delay={0.6}>
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-center">
                  <Button
                    size="lg"
                    onClick={() => signIn('github')}
                    className="bg-gradient-to-r from-gray-900 via-gray-800 to-black hover:from-black hover:to-gray-900 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 btn-hover-glow shadow-hover"
                  >
                    <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    Start Generating Docs
                  </Button>

                  <div className="text-sm text-gray-500">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Free to start</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>No credit card required</span>
                    </div>
                  </div>
                </div>
              </TextReveal>

              <TextReveal delay={0.8}>
                <div className="bg-gradient-to-r from-gray-50 to-orange-50/50 border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Tired of these developer pain points?</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span>Blank README syndrome</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span>Copy-paste templates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span>Outdated documentation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span>Confused contributors</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TextReveal>
            </div>

            {/* Right Section - 2/5 (Following Golden Ratio) */}
            <div className="lg:col-span-2">
              <TextReveal delay={1.0}>
                <div className="relative">
                  {/* Background decoration */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>

                  {/* Demo GIF */}
                  <div className="relative bg-white rounded-2xl p-4 shadow-2xl">
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                      <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-xs text-gray-300 font-mono">DocuGit in Action</p>
                        </div>
                      </div>
                      <div className="p-2">
                        <img
                          src="/demo.gif"
                          alt="DocuGit Demo - AI-powered documentation generation in action"
                          className="w-full rounded-lg"
                          onContextMenu={() => {}}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </TextReveal>
            </div>
            </div>
          </div>
        </section>

        {/* Developer Problem/Solution Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <TextReveal delay={0.1}>
                <p className="text-xl md:text-2xl leading-relaxed text-gray-700">
                  <span className="text-red-500 font-semibold">3 hours debugging</span> followed by
                  <span className="text-red-500 font-semibold"> 2 hours documenting</span> what you just fixed.
                </p>
              </TextReveal>
              <TextReveal delay={0.3}>
                <p className="text-xl md:text-2xl leading-relaxed text-gray-700 mt-2">
                  What if you could just <span className="text-green-500 font-semibold">paste your repo URL</span> and
                  <span className="text-green-500 font-semibold"> get docs instantly</span>?
                </p>
              </TextReveal>
            </div>
          </div>
        </section>

        {/* Features Section - Asymmetric Layout */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50/50">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-16 items-start">

              {/* Left - Features Grid (8 columns) */}
              <div className="lg:col-span-8">
                <TextReveal delay={0.2}>
                  <div className="mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                      <Sparkles className="h-4 w-4" />
                      Why DocuGit Works
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                      Built for Modern
                      <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Development Teams
                      </span>
                    </h2>
                  </div>
                </TextReveal>

                <div className="grid md:grid-cols-2 gap-6">
                  <TextReveal delay={0.3}>
                    <div className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="p-3 bg-orange-100 rounded-xl w-fit mb-4 group-hover:bg-orange-200 transition-colors">
                          <Brain className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">AI Code Understanding</h3>
                        <p className="text-gray-600 leading-relaxed">
                          Our AI reads code like a senior developer, understanding context, patterns, and dependencies to generate accurate documentation.
                        </p>
                      </div>
                    </div>
                  </TextReveal>

                  <TextReveal delay={0.4}>
                    <div className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="p-3 bg-green-100 rounded-xl w-fit mb-4 group-hover:bg-green-200 transition-colors">
                          <Bolt className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">30-Second Generation</h3>
                        <p className="text-gray-600 leading-relaxed">
                          From repository URL to comprehensive documentation in under 30 seconds. No more hours spent writing basic setup instructions.
                        </p>
                      </div>
                    </div>
                  </TextReveal>

                  <TextReveal delay={0.5}>
                    <div className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="p-3 bg-purple-100 rounded-xl w-fit mb-4 group-hover:bg-purple-200 transition-colors">
                          <GitBranch className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">GitHub Native</h3>
                        <p className="text-gray-600 leading-relaxed">
                          Direct integration with public and private repositories. Works with your existing workflow, no setup required.
                        </p>
                      </div>
                    </div>
                  </TextReveal>

                  <TextReveal delay={0.6}>
                    <div className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="p-3 bg-blue-100 rounded-xl w-fit mb-4 group-hover:bg-blue-200 transition-colors">
                          <Palette className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Multiple Formats</h3>
                        <p className="text-gray-600 leading-relaxed">
                          Generate README files, full documentation sites, or export to PDF, DOCX, and popular static site generators.
                        </p>
                      </div>
                    </div>
                  </TextReveal>
                </div>
              </div>

              {/* Right - Stats & Social Proof (4 columns) */}
              <div className="lg:col-span-4">
                <TextReveal delay={0.7}>
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
                    <h3 className="text-2xl font-bold mb-6">Trusted by Developers</h3>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                          <div className="text-3xl font-black text-green-400">120+</div>
                        </div>
                        <div>
                          <div className="font-semibold">READMEs Generated</div>
                          <div className="text-gray-400 text-sm">This month</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                          <div className="text-3xl font-black text-blue-400">98%</div>
                        </div>
                        <div>
                          <div className="font-semibold">Developer Satisfaction</div>
                          <div className="text-gray-400 text-sm">Based on feedback</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                          <div className="text-3xl font-black text-purple-400">45s</div>
                        </div>
                        <div>
                          <div className="font-semibold">Avg. Time Saved</div>
                          <div className="text-gray-400 text-sm">Per documentation</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-700">
                      <div className="text-sm text-gray-400 mb-3">Used by teams at:</div>
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-gray-800 px-3 py-1 rounded-full text-xs">Startups</div>
                        <div className="bg-gray-800 px-3 py-1 rounded-full text-xs">Enterprise</div>
                        <div className="bg-gray-800 px-3 py-1 rounded-full text-xs">Open Source</div>
                      </div>
                    </div>
                  </div>
                </TextReveal>

                <TextReveal delay={0.8}>
                  <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="text-center">
                      <div className="text-4xl mb-2">⚡</div>
                      <h4 className="font-bold text-gray-900 mb-2">Quick Start</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Ready to try? Connect your GitHub and generate your first documentation in under a minute.
                      </p>
                      <Button
                        onClick={() => signIn('github')}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 btn-hover-scale shadow-hover"
                      >
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        Try Now
                      </Button>
                    </div>
                  </div>
                </TextReveal>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <TextReveal delay={0.2}>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Workflow className="h-4 w-4" />
                  Simple Process
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                  From Code to Docs in
                  <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Three Simple Steps
                  </span>
                </h2>
              </div>
            </TextReveal>

            <div className="relative">
              {/* Connection Lines */}
              <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-px bg-gradient-to-r from-orange-200 via-green-200 to-purple-200 transform -translate-y-1/2"></div>

              <div className="grid lg:grid-cols-3 gap-12 relative">
                <TextReveal delay={0.3}>
                  <div className="relative group">
                    <div className="text-center relative z-10">
                      <div className="relative mb-8">
                        <div className="p-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                          <GitBranch className="h-16 w-16 text-orange-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect GitHub</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Simply sign in with your GitHub account and select any repository. Works with both public and private repos.
                      </p>
                    </div>
                  </div>
                </TextReveal>

                <TextReveal delay={0.4}>
                  <div className="relative group">
                    <div className="text-center relative z-10">
                      <div className="relative mb-8">
                        <div className="p-8 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                          <Brain className="h-16 w-16 text-green-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Our AI scans your codebase, understands the structure, identifies dependencies, and analyzes project patterns.
                      </p>
                    </div>
                  </div>
                </TextReveal>

                <TextReveal delay={0.5}>
                  <div className="relative group">
                    <div className="text-center relative z-10">
                      <div className="relative mb-8">
                        <div className="p-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                          <FileCode2 className="h-16 w-16 text-purple-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          3
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Documentation</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Receive professionally formatted documentation that you can use immediately or customize further.
                      </p>
                    </div>
                  </div>
                </TextReveal>
              </div>
            </div>
          </div>
        </section>

{/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent)] "></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,165,0,0.2),transparent)]"></div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <TextReveal delay={0.2}>
                <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                  Ready to Transform Your
                  <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Documentation Workflow?
                  </span>
                </h2>
                <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of developers who've automated their documentation workflow.
                  Start generating professional docs in 30 seconds.
                </p>
              </TextReveal>

              <TextReveal delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                  <Button
                    size="lg"
                    onClick={() => signIn('github')}
                    className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 btn-hover-glow shadow-hover"
                  >
                    <svg className="mr-3 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    Start Generating Docs Now
                  </Button>

                  <div className="text-gray-400 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Free to start, no setup required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Generate unlimited public repo docs</span>
                    </div>
                  </div>
                </div>
              </TextReveal>

              <TextReveal delay={0.6}>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="text-3xl font-black text-green-400 mb-2">30s</div>
                    <div className="text-gray-300">Average generation time</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="text-3xl font-black text-blue-400 mb-2">120+</div>
                    <div className="text-gray-300">READMEs generated this month</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="text-3xl font-black text-purple-400 mb-2">98%</div>
                    <div className="text-gray-300">Developer satisfaction</div>
                  </div>
                </div>
              </TextReveal>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-orange-500" />
              <span className="font-bold text-gray-900">DocuGit</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                Beta
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Made with ❤️ for developers
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}