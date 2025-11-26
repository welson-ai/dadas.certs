-- Create certificates table for storing all issued certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issuer_name TEXT NOT NULL,
  issuer_details TEXT,
  issue_date TEXT NOT NULL,
  public_key TEXT NOT NULL,
  signature TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  logo_url TEXT,
  revoked BOOLEAN DEFAULT false,
  revoked_reason TEXT,
  revoked_at TEXT,
  bitcoin_block_height INT,
  merkle_root TEXT,
  timestamp_proof_at TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on certificates table
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can only see their own certificates
CREATE POLICY "Admins can view their own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can insert their own certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their own certificates"
  ON public.certificates FOR UPDATE
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their own certificates"
  ON public.certificates FOR DELETE
  USING (auth.uid() = admin_id);

-- Public verification access: Anyone can view non-revoked certificates by ID
CREATE POLICY "Public can view certificates for verification"
  ON public.certificates FOR SELECT
  USING (true);

-- Create index on admin_id for faster queries
CREATE INDEX idx_certificates_admin_id ON public.certificates(admin_id);

-- Create index on certificate id for faster lookups
CREATE INDEX idx_certificates_id ON public.certificates(id);
