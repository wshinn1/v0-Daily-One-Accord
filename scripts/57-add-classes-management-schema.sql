-- Add Classes Management System
-- This script creates tables for managing church classes, enrollments, and attendance

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  location VARCHAR(255),
  schedule_day VARCHAR(50),
  schedule_time TIME,
  start_date DATE,
  end_date DATE,
  max_capacity INTEGER,
  age_group VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_enrollments table
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, user_id)
);

-- Create class_sessions table
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TIME,
  topic VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_attendance table
CREATE TABLE IF NOT EXISTS class_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'present',
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(session_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_classes_church_tenant ON classes(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON classes(is_active);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_user ON class_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_class ON class_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_session ON class_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_user ON class_attendance(user_id);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view classes for their church" ON classes;
DROP POLICY IF EXISTS "Admins can manage classes for their church" ON classes;
DROP POLICY IF EXISTS "Super admins can manage all classes" ON classes;

DROP POLICY IF EXISTS "Users can view enrollments for their church" ON class_enrollments;
DROP POLICY IF EXISTS "Users can enroll themselves" ON class_enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments for their church" ON class_enrollments;

DROP POLICY IF EXISTS "Users can view sessions for their church" ON class_sessions;
DROP POLICY IF EXISTS "Admins can manage sessions for their church" ON class_sessions;

DROP POLICY IF EXISTS "Users can view attendance for their church" ON class_attendance;
DROP POLICY IF EXISTS "Admins can manage attendance for their church" ON class_attendance;

-- RLS Policies for classes
CREATE POLICY "Users can view classes for their church"
  ON classes
  FOR SELECT
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage classes for their church"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    church_tenant_id IN (
      SELECT church_tenant_id FROM church_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pastor', 'elder', 'lead_admin')
    )
  );

CREATE POLICY "Super admins can manage all classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- RLS Policies for class_enrollments
CREATE POLICY "Users can view enrollments for their church"
  ON class_enrollments
  FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can enroll themselves"
  ON class_enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND class_id IN (
      SELECT id FROM classes
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage enrollments for their church"
  ON class_enrollments
  FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM church_members
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'pastor', 'elder', 'lead_admin')
      )
    )
  );

-- RLS Policies for class_sessions
CREATE POLICY "Users can view sessions for their church"
  ON class_sessions
  FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage sessions for their church"
  ON class_sessions
  FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes
      WHERE church_tenant_id IN (
        SELECT church_tenant_id FROM church_members
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'pastor', 'elder', 'lead_admin')
      )
    )
  );

-- RLS Policies for class_attendance
CREATE POLICY "Users can view attendance for their church"
  ON class_attendance
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM class_sessions
      WHERE class_id IN (
        SELECT id FROM classes
        WHERE church_tenant_id IN (
          SELECT church_tenant_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Admins can manage attendance for their church"
  ON class_attendance
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM class_sessions
      WHERE class_id IN (
        SELECT id FROM classes
        WHERE church_tenant_id IN (
          SELECT church_tenant_id FROM church_members
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'pastor', 'elder', 'lead_admin')
        )
      )
    )
  );

SELECT 'Classes management schema created successfully' AS result;
