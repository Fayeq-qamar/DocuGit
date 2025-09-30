import OpenAI from 'openai'
import { Repository } from '@/types'
import { generateUltraStylizedReadme, README_TEMPLATES, ReadmeTemplate } from './readme-generator'

interface AIConfig {
  provider: 'openai' | 'deepseek'
  apiKey: string
  baseURL?: string
}

class AIService {
  private client: OpenAI
  private provider: string

  constructor(config: AIConfig) {
    this.provider = config.provider

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    })
  }

  async generateDocumentation(
    repositoryData: Repository,
    options: {
      type: 'readme' | 'api-docs' | 'user-guide'
      style: 'minimal' | 'comprehensive' | 'documentation' | 'portfolio'
    }
  ): Promise<string> {
    // For README generation, use our ultra-stylized generator
    if (options.type === 'readme') {
      return await this.generateStylizedReadme(repositoryData, options.style)
    }

    // For other documentation types, use AI generation
    const prompt = this.buildPrompt(repositoryData, options)

    const response = await this.client.chat.completions.create({
      model: this.getModel(),
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical writer and software documentation specialist. Generate clear, comprehensive, and well-structured documentation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: this.getMaxTokens(options.type),
    })

    return response.choices[0]?.message?.content || ''
  }

  private async generateStylizedReadme(
    repository: Repository,
    templateName: string
  ): Promise<string> {
    // Get the appropriate template
    const template = README_TEMPLATES[templateName] || README_TEMPLATES.comprehensive

    // Generate the ultra-stylized README
    return await generateUltraStylizedReadme(repository, template)
  }

  private buildPrompt(repositoryData: any, options: any): string {
    const { name, description, languages, files, dependencies } = repositoryData

    return `
Generate ${options.type} documentation for the following repository:

Repository: ${name}
Description: ${description || 'No description provided'}
Main Languages: ${Object.keys(languages || {}).join(', ')}
Key Files: ${files?.slice(0, 10).map((f: any) => f.name).join(', ') || 'No files listed'}
Dependencies: ${dependencies?.slice(0, 5).join(', ') || 'No dependencies listed'}

Style: ${options.style}
Type: ${options.type}

Please include:
- Clear project overview
- Installation instructions
- Usage examples
- API documentation (if applicable)
- Contributing guidelines
- License information

Format the output in clean Markdown.
`
  }

  private getModel(): string {
    switch (this.provider) {
      case 'deepseek':
        return process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-chat-v3.1:free'
      case 'openai':
        return 'gpt-4'
      default:
        return 'gpt-3.5-turbo'
    }
  }

  private getMaxTokens(type: string): number {
    switch (type) {
      case 'readme':
        return 2000
      case 'api-docs':
        return 4000
      case 'user-guide':
        return 3000
      default:
        return 2000
    }
  }
}

// Factory function to create AI service based on environment
export function createAIService(): AIService {
  const provider = (process.env.AI_PROVIDER as 'openai' | 'deepseek') || 'deepseek'

  let config: AIConfig

  if (provider === 'deepseek') {
    config = {
      provider: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY!,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
    }
  } else {
    config = {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY!,
    }
  }

  return new AIService(config)
}

export default AIService