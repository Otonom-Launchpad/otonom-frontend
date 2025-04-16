-- Drop existing RLS policies for projects table
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;

-- Create new policies for the projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view projects
CREATE POLICY "Projects are viewable by everyone" 
  ON projects FOR SELECT 
  USING (true);

-- Allow admin to insert projects (for seeding)
CREATE POLICY "Admin can insert projects"
  ON projects FOR INSERT
  WITH CHECK (true);

-- Allow admin to update projects
CREATE POLICY "Admin can update projects"
  ON projects FOR UPDATE
  USING (true);
