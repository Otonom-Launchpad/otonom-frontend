-- ===============================================
-- Row Level Security Policies for Otonom Fund
-- ===============================================

-- Enable Row Level Security (RLS) on the projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- READ POLICIES
-- ===============================================

-- CRITICAL: Create policy for public read access to ALL projects
-- This will allow anyone to read project data without authentication
CREATE POLICY "Public read access for all projects" 
ON projects 
FOR SELECT 
USING (true);

-- ===============================================
-- WRITE POLICIES
-- ===============================================

-- Create policy for admin access (full CRUD operations) 
-- For hackathon purposes, you can customize this when you have admin functionality
CREATE POLICY "Admin users can do anything" 
ON projects 
FOR ALL 
TO authenticated 
USING (auth.uid() IN (SELECT id FROM admin_users WHERE active = true));

-- Create policy for project creation by authorized users
CREATE POLICY "Authorized users can create projects"
ON projects
FOR INSERT
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM authorized_project_creators));

-- Create policy for project updates by project owners
CREATE POLICY "Project owners can update their projects"
ON projects
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- For now, we don't allow regular users to delete projects - only admins can delete

-- Note: You can execute this SQL in the Supabase dashboard's SQL Editor
