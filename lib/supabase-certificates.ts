import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { SignedCertificate } from "@/lib/crypto"

// Browser client functions
export async function saveCertificateToSupabase(certificate: SignedCertificate, adminId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("certificates").insert([
    {
      id: certificate.id,
      admin_id: adminId,
      recipient_name: certificate.recipientName,
      course_name: certificate.courseName,
      issuer_name: certificate.issuerName,
      issuer_details: certificate.issuerOrganization,
      issue_date: certificate.issueDate,
      public_key: certificate.publicKey,
      signature: certificate.signature,
      timestamp: new Date().toISOString(),
      logo_url: certificate.logoUrl,
      revoked: false,
    },
  ])

  return { data, error }
}

export async function getCertificatesByAdmin(adminId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("admin_id", adminId)
    .order("created_at", { ascending: false })

  return { data, error }
}

export async function revokeCertificateInSupabase(certId: string, reason: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("certificates")
    .update({
      revoked: true,
      revoked_reason: reason,
      revoked_at: new Date().toISOString(),
    })
    .eq("id", certId)

  return { data, error }
}

export async function deleteCertificateFromSupabase(certId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("certificates").delete().eq("id", certId)

  return { data, error }
}

// Public function to get any certificate by ID (for verification page)
export async function getPublicCertificateById(certId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("certificates").select("*").eq("id", certId).single()

  return { data, error }
}
