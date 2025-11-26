"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CertificateDisplay } from "@/components/certificate-display"
import { Share2, AlertCircle } from "lucide-react"
import { getCertificateById } from "@/lib/storage"
import type { SignedCertificate } from "@/lib/crypto"

export default function CertificatePage() {
  const params = useParams()
  const id = params.id as string
  const [certificate, setCertificate] = useState<SignedCertificate | null>(null)
  const [verificationUrl, setVerificationUrl] = useState("")

  useEffect(() => {
    const cert = getCertificateById(id)
    setCertificate(cert)

    if (cert && typeof window !== "undefined") {
      const url = `${window.location.origin}/verify?data=${encodeURIComponent(JSON.stringify(cert))}`
      setVerificationUrl(url)
    }
  }, [id])

  const handleShare = async () => {
    if (verificationUrl && navigator.share) {
      try {
        await navigator.share({
          title: "My Certificate",
          text: "Check out my certificate!",
          url: verificationUrl,
        })
      } catch (error) {
        // User cancelled or share failed
        copyToClipboard(verificationUrl)
      }
    } else {
      copyToClipboard(verificationUrl)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Verification link copied to clipboard!")
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Certificate not found. Please check the certificate ID.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Your Certificate</h1>
            <p className="text-slate-600 dark:text-slate-400">Digitally signed and verifiable</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <CertificateDisplay certificate={certificate} qrCodeUrl={verificationUrl} logoUrl={certificate.logoUrl} />

        <Card>
          <CardHeader>
            <CardTitle>Verification</CardTitle>
            <CardDescription>This certificate is cryptographically signed and can be verified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Verification URL:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verificationUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md font-mono"
                />
                <Button onClick={() => copyToClipboard(verificationUrl)} variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Anyone with this URL can verify the authenticity of this certificate using the embedded cryptographic
                signature.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
