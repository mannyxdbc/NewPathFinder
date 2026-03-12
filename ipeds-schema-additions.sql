-- Schema additions for IPEDS integration
-- Run this SQL in your Supabase SQL Editor

-- Add IPEDS unit ID to schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ipeds_unit_id TEXT;

-- Add CIP code to programs table (Classification of Instructional Programs)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS cip_code TEXT;

-- Add average scores to admission_requirements
ALTER TABLE admission_requirements ADD COLUMN IF NOT EXISTS gpa_average DECIMAL(3,2);
ALTER TABLE admission_requirements ADD COLUMN IF NOT EXISTS sat_math_average INTEGER;
ALTER TABLE admission_requirements ADD COLUMN IF NOT EXISTS sat_reading_average INTEGER;
ALTER TABLE admission_requirements ADD COLUMN IF NOT EXISTS act_composite_average INTEGER;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schools_ipeds_unit_id ON schools(ipeds_unit_id);
CREATE INDEX IF NOT EXISTS idx_programs_cip_code ON programs(cip_code);

-- Add comments for documentation
COMMENT ON COLUMN schools.ipeds_unit_id IS 'IPEDS Unit ID for US institutions (from NCES)';
COMMENT ON COLUMN programs.cip_code IS 'Classification of Instructional Programs code (6-digit code)';
