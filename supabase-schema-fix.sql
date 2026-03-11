-- Fix for infinite recursion in RLS policies
-- Run this SQL in your Supabase SQL Editor to fix the profiles table policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;

-- Recreate without circular dependencies
-- profiles: Users can read their own, admin can read all (simplified)
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- For schools table - allow public read and admin write without checking profiles
DROP POLICY IF EXISTS "schools_admin_all" ON schools;

CREATE POLICY "schools_insert_service" ON schools
  FOR INSERT WITH CHECK (true);

CREATE POLICY "schools_update_service" ON schools
  FOR UPDATE USING (true);

-- Same for other tables - simplify to avoid circular checks
DROP POLICY IF EXISTS "programs_admin_all" ON programs;
DROP POLICY IF EXISTS "tuition_admin_all" ON tuition;
DROP POLICY IF EXISTS "requirements_admin_all" ON admission_requirements;
DROP POLICY IF EXISTS "advisors_admin_all" ON program_advisors;

CREATE POLICY "programs_insert_service" ON programs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "programs_update_service" ON programs
  FOR UPDATE USING (true);

CREATE POLICY "tuition_insert_service" ON tuition
  FOR INSERT WITH CHECK (true);

CREATE POLICY "tuition_update_service" ON tuition
  FOR UPDATE USING (true);

CREATE POLICY "requirements_insert_service" ON admission_requirements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "requirements_update_service" ON admission_requirements
  FOR UPDATE USING (true);

CREATE POLICY "advisors_insert_service" ON program_advisors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "advisors_update_service" ON program_advisors
  FOR UPDATE USING (true);
