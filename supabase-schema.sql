-- ScholarPath Database Schema
-- Based on TDD v1.0 - All 9 tables with RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: program_levels
-- ============================================================================
CREATE TABLE program_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('undergraduate', 'graduate', 'professional')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the three levels
INSERT INTO program_levels (name, description) VALUES
  ('undergraduate', 'Bachelor''s degree programs for students completing their first degree'),
  ('graduate', 'Master''s and doctoral programs requiring a completed undergraduate degree'),
  ('professional', 'Advanced professional degrees such as MBA, JD, MD requiring prior experience or education');

-- ============================================================================
-- TABLE 2: schools
-- ============================================================================
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website TEXT,
  city TEXT,
  state_province TEXT,
  country TEXT CHECK (country IN ('US', 'CA')),
  accreditation TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE 3: programs
-- ============================================================================
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES program_levels(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  degree_type TEXT NOT NULL,
  format TEXT CHECK (format IN ('full-time', 'part-time', 'online', 'hybrid')),
  duration_months INTEGER CHECK (duration_months > 0),
  duration_semesters INTEGER CHECK (duration_semesters > 0),
  credit_hours INTEGER CHECK (credit_hours > 0),
  admissions_url TEXT,
  data_source TEXT CHECK (data_source IN ('manual', 'ipeds', 'scraped', 'user_correction')),
  last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, slug)
);

-- Create index for full-text search
CREATE INDEX programs_search_idx ON programs USING GIN(
  to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(degree_type, '') || ' ' ||
    coalesce(description, '')
  )
);

-- ============================================================================
-- TABLE 4: tuition
-- ============================================================================
CREATE TABLE tuition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE UNIQUE,
  semester_1_tuition DECIMAL(10, 2) CHECK (semester_1_tuition >= 0),
  semester_2_tuition DECIMAL(10, 2) CHECK (semester_2_tuition >= 0),
  per_semester_note TEXT,
  total_tuition DECIMAL(10, 2) CHECK (total_tuition >= 0),
  fees_per_semester DECIMAL(10, 2) CHECK (fees_per_semester >= 0),
  currency TEXT CHECK (currency IN ('USD', 'CAD')) DEFAULT 'USD',
  academic_year TEXT,
  last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE 5: admission_requirements
-- ============================================================================
CREATE TABLE admission_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE UNIQUE,
  gpa_minimum DECIMAL(3, 2) CHECK (gpa_minimum >= 0 AND gpa_minimum <= 4.0),
  gpa_average DECIMAL(3, 2) CHECK (gpa_average >= 0 AND gpa_average <= 4.0),
  gmat_gre_required TEXT CHECK (gmat_gre_required IN ('required', 'optional', 'waivable', 'not_accepted')),
  gmat_average INTEGER CHECK (gmat_average >= 200 AND gmat_average <= 800),
  gre_average INTEGER CHECK (gre_average >= 260 AND gre_average <= 340),
  work_exp_years_min INTEGER CHECK (work_exp_years_min >= 0),
  work_exp_years_avg INTEGER CHECK (work_exp_years_avg >= 0),
  lor_count INTEGER CHECK (lor_count >= 0 AND lor_count <= 10),
  lor_notes TEXT,
  sop_required BOOLEAN DEFAULT FALSE,
  sop_word_limit INTEGER CHECK (sop_word_limit > 0),
  english_test_required TEXT CHECK (english_test_required IN ('required', 'optional', 'waived_for_native_speakers', 'not_required')),
  english_test_types TEXT,
  english_min_score DECIMAL(5, 2) CHECK (english_min_score >= 0),
  other_requirements TEXT,
  last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE 6: program_advisors
-- ============================================================================
CREATE TABLE program_advisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT,
  title TEXT,
  role_type TEXT CHECK (role_type IN ('admissions_office', 'program_advisor', 'financial_aid', 'department_contact')),
  email TEXT,
  phone TEXT,
  office_hours TEXT,
  response_time_days INTEGER CHECK (response_time_days >= 0),
  last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE 7: users (managed by Supabase Auth, extended with profiles)
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE 8: saved_programs
-- ============================================================================
CREATE TABLE saved_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  notes TEXT CHECK (LENGTH(notes) <= 500),
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, program_id)
);

-- ============================================================================
-- TABLE 9: data_change_log
-- ============================================================================
CREATE TABLE data_change_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_source TEXT CHECK (change_source IN ('admin_manual', 'ipeds_import', 'scraper_update', 'user_correction', 'user_flag')),
  changed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE program_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_change_log ENABLE ROW LEVEL SECURITY;

-- program_levels: Public read access
CREATE POLICY "program_levels_select" ON program_levels
  FOR SELECT USING (true);

-- schools: Public read access
CREATE POLICY "schools_select" ON schools
  FOR SELECT USING (true);

CREATE POLICY "schools_admin_all" ON schools
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- programs: Public can see published, admin can see all
CREATE POLICY "programs_select_published" ON programs
  FOR SELECT USING (is_published = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "programs_admin_all" ON programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- tuition: Public can see for published programs, admin all
CREATE POLICY "tuition_select" ON tuition
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM programs WHERE programs.id = tuition.program_id AND programs.is_published = true)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "tuition_admin_all" ON tuition
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- admission_requirements: Public can see for published programs
CREATE POLICY "requirements_select" ON admission_requirements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM programs WHERE programs.id = admission_requirements.program_id AND programs.is_published = true)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "requirements_admin_all" ON admission_requirements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- program_advisors: Authenticated users only (gated behind login)
CREATE POLICY "advisors_select_authenticated" ON program_advisors
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "advisors_admin_all" ON program_advisors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- profiles: Users can read their own, admin can read all
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- saved_programs: Users can only see and modify their own
CREATE POLICY "saved_programs_select_own" ON saved_programs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "saved_programs_insert_own" ON saved_programs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "saved_programs_delete_own" ON saved_programs
  FOR DELETE USING (user_id = auth.uid());

-- data_change_log: Admin only read, authenticated users can insert flags
CREATE POLICY "change_log_select_admin" ON data_change_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "change_log_insert_authenticated" ON data_change_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "change_log_admin_all" ON data_change_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for programs table
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, is_admin)
  VALUES (NEW.id, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX programs_school_id_idx ON programs(school_id);
CREATE INDEX programs_level_id_idx ON programs(level_id);
CREATE INDEX programs_is_published_idx ON programs(is_published);
CREATE INDEX programs_last_verified_idx ON programs(last_verified_at);

CREATE INDEX tuition_program_id_idx ON tuition(program_id);
CREATE INDEX admission_requirements_program_id_idx ON admission_requirements(program_id);
CREATE INDEX program_advisors_program_id_idx ON program_advisors(program_id);

CREATE INDEX saved_programs_user_id_idx ON saved_programs(user_id);
CREATE INDEX saved_programs_program_id_idx ON saved_programs(program_id);

CREATE INDEX data_change_log_program_id_idx ON data_change_log(program_id);
CREATE INDEX data_change_log_changed_at_idx ON data_change_log(changed_at);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert a sample school
INSERT INTO schools (name, slug, website, city, state_province, country, accreditation)
VALUES (
  'Stanford Graduate School of Business',
  'stanford-gsb',
  'https://www.gsb.stanford.edu',
  'Stanford',
  'CA',
  'US',
  'AACSB'
);

-- Get the school ID for the sample program
DO $$
DECLARE
  stanford_id UUID;
  graduate_level_id UUID;
  sample_program_id UUID;
BEGIN
  SELECT id INTO stanford_id FROM schools WHERE slug = 'stanford-gsb';
  SELECT id INTO graduate_level_id FROM program_levels WHERE name = 'graduate';

  -- Insert a sample MBA program
  INSERT INTO programs (
    school_id, level_id, name, slug, description, degree_type, format,
    duration_months, duration_semesters, credit_hours, admissions_url,
    data_source, is_published
  ) VALUES (
    stanford_id,
    graduate_level_id,
    'Master of Business Administration',
    'mba-full-time',
    'Stanford GSB''s MBA program is a two-year full-time program that develops leaders who can create positive impact in business and society.',
    'MBA',
    'full-time',
    24,
    4,
    70,
    'https://www.gsb.stanford.edu/programs/mba',
    'manual',
    true
  ) RETURNING id INTO sample_program_id;

  -- Insert sample tuition
  INSERT INTO tuition (
    program_id, semester_1_tuition, semester_2_tuition, total_tuition,
    fees_per_semester, currency, academic_year, source_url
  ) VALUES (
    sample_program_id,
    39000,
    39000,
    78000,
    1500,
    'USD',
    '2025-2026',
    'https://www.gsb.stanford.edu/programs/mba/admission/tuition-financial-aid'
  );

  -- Insert sample admission requirements
  INSERT INTO admission_requirements (
    program_id, gpa_average, gmat_gre_required, gmat_average,
    work_exp_years_avg, lor_count, sop_required, english_test_required
  ) VALUES (
    sample_program_id,
    3.7,
    'optional',
    730,
    4,
    2,
    true,
    'required'
  );

  -- Insert sample advisor
  INSERT INTO program_advisors (
    program_id, name, title, role_type, email, office_hours
  ) VALUES (
    sample_program_id,
    'MBA Admissions Office',
    'Admissions Team',
    'admissions_office',
    'mba-admissions@gsb.stanford.edu',
    'Monday-Friday 9am-5pm PST'
  );
END $$;

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- Schema creation complete.
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Update .env.local with your Supabase credentials
-- 3. Test by signing up a user and exploring the sample data
