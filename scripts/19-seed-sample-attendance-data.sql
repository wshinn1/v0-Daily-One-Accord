-- Seed sample attendance data for demonstration purposes
-- This script creates sample events and attendance records

-- First, let's create some sample church service events for the past 12 weeks
-- We'll use the first church tenant we find
DO $$
DECLARE
  tenant_id UUID;
  service_event_id UUID;
  week_offset INTEGER;
  service_date TIMESTAMP WITH TIME ZONE;
  user_record RECORD;
  attendance_probability DECIMAL;
BEGIN
  -- Get the first church tenant
  SELECT id INTO tenant_id FROM church_tenants LIMIT 1;
  
  IF tenant_id IS NULL THEN
    RAISE NOTICE 'No church tenants found. Please create a church first.';
    RETURN;
  END IF;

  RAISE NOTICE 'Creating sample data for church tenant: %', tenant_id;

  -- Create church service events for the past 12 weeks (Sundays at 10 AM)
  FOR week_offset IN 0..11 LOOP
    service_date := DATE_TRUNC('week', NOW()) - (week_offset * INTERVAL '1 week') + INTERVAL '10 hours';
    
    INSERT INTO events (
      church_tenant_id,
      title,
      description,
      start_time,
      end_time,
      location,
      is_default_service,
      event_type,
      is_public
    ) VALUES (
      tenant_id,
      'Sunday Service',
      'Weekly worship service',
      service_date,
      service_date + INTERVAL '2 hours',
      'Main Sanctuary',
      TRUE,
      'church_service',
      TRUE
    ) RETURNING id INTO service_event_id;

    -- Create attendance records for this service
    -- Each user has a different attendance probability to create realistic patterns
    FOR user_record IN 
      SELECT cm.user_id, u.full_name
      FROM church_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.church_tenant_id = tenant_id
      LIMIT 20  -- Limit to first 20 members
    LOOP
      -- Assign different attendance probabilities based on user position
      -- This creates realistic patterns: some attend regularly, others sporadically
      attendance_probability := 0.5 + (RANDOM() * 0.5);  -- Between 50% and 100%
      
      -- Randomly decide if this user attended based on their probability
      IF RANDOM() < attendance_probability THEN
        INSERT INTO attendance (
          church_tenant_id,
          event_id,
          user_id,
          attended_at,
          notes
        ) VALUES (
          tenant_id,
          service_event_id,
          user_record.user_id,
          service_date,
          NULL
        ) ON CONFLICT (event_id, user_id) DO NOTHING;
      END IF;
    END LOOP;

    RAISE NOTICE 'Created church service for week %', week_offset;
  END LOOP;

  -- Create some other event types for variety
  -- Bible Study (Wednesdays)
  FOR week_offset IN 0..5 LOOP
    service_date := DATE_TRUNC('week', NOW()) - (week_offset * INTERVAL '1 week') + INTERVAL '3 days' + INTERVAL '19 hours';
    
    INSERT INTO events (
      church_tenant_id,
      title,
      description,
      start_time,
      end_time,
      location,
      is_default_service,
      event_type,
      is_public
    ) VALUES (
      tenant_id,
      'Wednesday Bible Study',
      'Midweek Bible study and prayer',
      service_date,
      service_date + INTERVAL '1.5 hours',
      'Fellowship Hall',
      FALSE,
      'bible_study',
      TRUE
    ) RETURNING id INTO service_event_id;

    -- Add attendance for Bible study (typically lower attendance)
    FOR user_record IN 
      SELECT cm.user_id
      FROM church_members cm
      WHERE cm.church_tenant_id = tenant_id
      ORDER BY RANDOM()
      LIMIT 12  -- Fewer people attend Bible study
    LOOP
      IF RANDOM() < 0.6 THEN  -- 60% attendance probability
        INSERT INTO attendance (
          church_tenant_id,
          event_id,
          user_id,
          attended_at
        ) VALUES (
          tenant_id,
          service_event_id,
          user_record.user_id,
          service_date
        ) ON CONFLICT (event_id, user_id) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;

  -- Create Youth Group events (Fridays)
  FOR week_offset IN 0..5 LOOP
    service_date := DATE_TRUNC('week', NOW()) - (week_offset * INTERVAL '1 week') + INTERVAL '5 days' + INTERVAL '18 hours';
    
    INSERT INTO events (
      church_tenant_id,
      title,
      description,
      start_time,
      end_time,
      location,
      is_default_service,
      event_type,
      is_public
    ) VALUES (
      tenant_id,
      'Youth Group',
      'Friday night youth gathering',
      service_date,
      service_date + INTERVAL '2 hours',
      'Youth Room',
      FALSE,
      'youth_group',
      TRUE
    ) RETURNING id INTO service_event_id;

    -- Add attendance for youth group
    FOR user_record IN 
      SELECT cm.user_id
      FROM church_members cm
      WHERE cm.church_tenant_id = tenant_id
      ORDER BY RANDOM()
      LIMIT 8  -- Smaller youth group
    LOOP
      IF RANDOM() < 0.7 THEN  -- 70% attendance probability
        INSERT INTO attendance (
          church_tenant_id,
          event_id,
          user_id,
          attended_at
        ) VALUES (
          tenant_id,
          service_event_id,
          user_record.user_id,
          service_date
        ) ON CONFLICT (event_id, user_id) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;

  -- Create a few special events
  -- Prayer Meeting
  service_date := NOW() - INTERVAL '2 weeks' + INTERVAL '19 hours';
  INSERT INTO events (
    church_tenant_id,
    title,
    description,
    start_time,
    end_time,
    location,
    is_default_service,
    event_type,
    is_public
  ) VALUES (
    tenant_id,
    'Monthly Prayer Meeting',
    'Corporate prayer for our church and community',
    service_date,
    service_date + INTERVAL '1 hour',
    'Prayer Room',
    FALSE,
    'prayer_meeting',
    TRUE
  ) RETURNING id INTO service_event_id;

  -- Add attendance
  FOR user_record IN 
    SELECT cm.user_id
    FROM church_members cm
    WHERE cm.church_tenant_id = tenant_id
    ORDER BY RANDOM()
    LIMIT 15
  LOOP
    IF RANDOM() < 0.5 THEN
      INSERT INTO attendance (
        church_tenant_id,
        event_id,
        user_id,
        attended_at
      ) VALUES (
        tenant_id,
        service_event_id,
        user_record.user_id,
        service_date
      ) ON CONFLICT (event_id, user_id) DO NOTHING;
    END IF;
  END LOOP;

  RAISE NOTICE 'Sample attendance data created successfully!';
  RAISE NOTICE 'Created 12 Sunday services, 6 Bible studies, 6 Youth groups, and 1 prayer meeting';
END $$;
