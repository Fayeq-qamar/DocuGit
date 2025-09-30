-- DocuGit Database Schema
-- This file contains the complete database schema for DocuGit

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for NextAuth integration)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE,
    name VARCHAR,
    avatar_url VARCHAR,
    github_username VARCHAR UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_tier VARCHAR DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    usage_count INTEGER DEFAULT 0,
    monthly_usage_reset DATE DEFAULT CURRENT_DATE
);

-- Projects table (for generated documentation projects)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    repository_url VARCHAR NOT NULL,
    repository_name VARCHAR NOT NULL,
    repository_owner VARCHAR NOT NULL,
    title VARCHAR,
    description TEXT,
    readme_content TEXT,
    documentation_config JSONB DEFAULT '{}',
    status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_generated TIMESTAMP WITH TIME ZONE,
    generation_count INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT false,
    tags VARCHAR[] DEFAULT '{}'
);

-- Analytics table (for usage tracking)
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    action VARCHAR NOT NULL CHECK (action IN ('create', 'generate', 'download', 'update', 'view')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    preferences JSONB DEFAULT '{}',
    api_keys JSONB DEFAULT '{}', -- Encrypted API keys for integrations
    notification_settings JSONB DEFAULT '{"email": true, "browser": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repository favorites table
CREATE TABLE IF NOT EXISTS public.repository_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    repository_url VARCHAR NOT NULL,
    repository_name VARCHAR NOT NULL,
    repository_owner VARCHAR NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, repository_url)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_github_id ON public.users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_repository_url ON public.projects(repository_url);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics(created_at);

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = github_id OR auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = github_id OR auth.uid()::text = id::text);

-- RLS Policies for projects table
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = github_id OR auth.uid()::text = id::text));

CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = github_id OR auth.uid()::text = id::text));

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = github_id OR auth.uid()::text = id::text));

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = github_id OR auth.uid()::text = id::text));

-- RLS Policies for analytics table
CREATE POLICY "Users can view own analytics" ON public.analytics
    FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = github_id OR auth.uid()::text = id::text));

CREATE POLICY "System can insert analytics" ON public.analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for user_settings table
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = github_id OR auth.uid()::text = id::text));

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = github_id OR auth.uid()::text = id::text));

-- RLS Policies for repository_favorites table
CREATE POLICY "Users can manage own favorites" ON public.repository_favorites
    FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = github_id OR auth.uid()::text = id::text));

-- Create views for common queries
CREATE VIEW user_project_summary AS
SELECT
    u.id as user_id,
    u.name,
    u.github_username,
    COUNT(p.id) as total_projects,
    COUNT(CASE WHEN p.status = 'published' THEN 1 END) as published_projects,
    SUM(p.generation_count) as total_generations,
    u.usage_count,
    u.subscription_tier
FROM public.users u
LEFT JOIN public.projects p ON u.id = p.user_id
GROUP BY u.id, u.name, u.github_username, u.usage_count, u.subscription_tier;

-- Insert default data (optional)
-- This will be handled by the application during user signup