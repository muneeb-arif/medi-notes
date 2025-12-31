-- =====================================================
-- MediNote Full Database Schema v1
-- Auth: Phone + OTP
-- DB: PostgreSQL
-- =====================================================

CREATE DATABASE medinote;

-- \c medinote;


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ACCOUNTS (Real Person)
-- =====================================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    phone TEXT NOT NULL UNIQUE,
    recovery_phone TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,

    full_name TEXT,
    date_of_birth DATE,
    blood_group TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),

    height_cm INTEGER,
    weight_kg INTEGER,

    marital_status TEXT,
    number_of_children INTEGER DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ACCOUNT SETTINGS
-- =====================================================

CREATE TABLE account_settings (
    account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,

    language TEXT NOT NULL DEFAULT 'en',
    emergency_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- EMERGENCY CONTACTS
-- =====================================================

CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    relation TEXT,
    phone TEXT NOT NULL,
    priority_order INTEGER DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PROFILES (Medical Contexts)
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (account_id, name)
);

-- =====================================================
-- REPORTS
-- =====================================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    report_type TEXT NOT NULL,
    file_key TEXT NOT NULL,
    file_mime_type TEXT NOT NULL,
    report_date DATE,

    is_emergency_visible BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE profile_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    UNIQUE (profile_id, report_id)
);

-- =====================================================
-- VITALS
-- =====================================================

CREATE TABLE vitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    type TEXT NOT NULL,
    value_json JSONB NOT NULL,
    recorded_at TIMESTAMP NOT NULL,

    is_emergency_visible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE vital_profile_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vital_id UUID NOT NULL REFERENCES vitals(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE (vital_id, profile_id)
);

-- =====================================================
-- CONDITIONS
-- =====================================================

CREATE TABLE conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('major', 'chronic')) NOT NULL,
    diagnosed_at DATE,
    is_active BOOLEAN DEFAULT TRUE,

    is_emergency_visible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- MEDICATIONS
-- =====================================================

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('ongoing', 'stopped')) NOT NULL,

    is_emergency_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- APPOINTMENTS
-- =====================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    specialty TEXT,
    doctor_name TEXT,
    facility TEXT,
    location TEXT,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) NOT NULL DEFAULT 'scheduled',
    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PROCEDURES
-- =====================================================

CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    type TEXT CHECK (type IN ('surgery', 'hospitalization')) NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,

    is_emergency_visible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ALLERGIES
-- =====================================================

CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    type TEXT NOT NULL,
    substance TEXT NOT NULL,
    severity TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- FAMILY LINKS
-- =====================================================

CREATE TABLE family_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    related_name TEXT NOT NULL,
    relation TEXT,
    blood_group TEXT,
    phone TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- AUTH TABLES
-- =====================================================

CREATE TABLE otp_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    phone TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    channel TEXT CHECK (channel IN ('sms', 'whatsapp')) NOT NULL,
    purpose TEXT CHECK (purpose IN ('login', 'recovery')) NOT NULL,

    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    attempts_used INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,

    ip TEXT,
    user_agent TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    refresh_token_hash TEXT NOT NULL,
    device_id TEXT,
    platform TEXT CHECK (platform IN ('ios', 'android')),
    revoked_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE login_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    phone TEXT NOT NULL,
    event_type TEXT NOT NULL,
    reason TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SHARING & ACCESS LOGS
-- =====================================================

CREATE TABLE profile_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    shared_with_phone TEXT,
    shared_with_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,

    access_scope_json JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    actor_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,

    action TEXT NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    report_id UUID REFERENCES reports(id) ON DELETE SET NULL,

    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- EMERGENCY
-- =====================================================

CREATE TABLE emergency_nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    relation TEXT,
    phone TEXT NOT NULL,
    access_method TEXT CHECK (access_method IN ('otp', 'app')) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE emergency_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID UNIQUE NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    snapshot_json JSONB NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
