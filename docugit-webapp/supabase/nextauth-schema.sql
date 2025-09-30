-- DocuGit Database Schema with NextAuth Integration
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- NextAuth.js required tables
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR,
    email VARCHAR UNIQUE,
    "emailVerified" TIMESTAMPTZ,
    image VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    provider VARCHAR NOT NULL,
    "providerAccountId" VARCHAR NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type VARCHAR,
    scope VARCHAR,
    id_token TEXT,
    session_state VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionToken" VARCHAR NOT NULL UNIQUE,
    "userId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.verification_tokens (
    identifier VARCHAR NOT NULL,
    token VARCHAR NOT NULL UNIQUE,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- DocuGit custom tables
-- User profiles (extending NextAuth users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    github_id VARCHAR UNIQUE,
    github_username VARCHAR UNIQUE,
    avatar_url VARCHAR,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_tier VARCHAR DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    usage_count INTEGER DEFAULT 0,
    monthly_usage_reset DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON public.sessions("sessionToken");
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_github_id ON public.user_profiles(github_id);
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

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for NextAuth tables
-- These policies allow NextAuth to manage its own tables
CREATE POLICY "Allow NextAuth to manage users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow NextAuth to manage accounts" ON public.accounts FOR ALL USING (true);
CREATE POLICY "Allow NextAuth to manage sessions" ON public.sessions FOR ALL USING (true);
CREATE POLICY "Allow access to verification tokens" ON public.verification_tokens FOR ALL USING (true);

-- RLS Policies for user profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (user_id = auth.uid()::uuid);

CREATE POLICY "Allow profile creation" ON public.user_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

-- RLS Policies for projects table
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (user_id = auth.uid()::uuid);

-- RLS Policies for analytics table
CREATE POLICY "Users can view own analytics" ON public.analytics
    FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "System can insert analytics" ON public.analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for repository_favorites table
CREATE POLICY "Users can manage own favorites" ON public.repository_favorites
    FOR ALL USING (user_id = auth.uid()::uuid);

-- Create views for common queries
CREATE VIEW user_project_summary AS
SELECT
    u.id as user_id,
    u.name,
    up.github_username,
    COUNT(p.id) as total_projects,
    COUNT(CASE WHEN p.status = 'published' THEN 1 END) as published_projects,
    SUM(p.generation_count) as total_generations,
    up.usage_count,
    up.subscription_tier
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN public.projects p ON u.id = p.user_id
GROUP BY u.id, u.name, up.github_username, up.usage_count, up.subscription_tier;