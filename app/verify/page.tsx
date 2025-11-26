"use client"

import type React from "react"
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Ban,
  Bitcoin,
  ArrowLeft,
  Trash2,
  Download,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CertificateDisplay } from "@/components/certificate-display"
import { verifyCertificate } from "@/lib/crypto"
import type { SignedCertificate } from "@/lib/crypto"
import { getPublicCertificateById } from "@/lib/supabase-certificates"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const [certificate, setCertificate] = useState<SignedCertificate | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "valid" | "invalid" | "revoked">(
    "idle",
  )
  const [jsonInput, setJsonInput] = useState("")
  const [certificateId, setCertificateId] = useState("")
  const [error, setError] = useState("")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  useEffect(() => {
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const cert = JSON.parse(decodeURIComponent(dataParam))
        handleVerifyCertificate(cert)
      } catch (error) {
        setError("Invalid certificate data in URL")
      }
    }
  }, [searchParams])

  const handleVerifyCertificate = async (cert: SignedCertificate) => {
    setError("")
    setVerificationStatus("verifying")
    setCertificate(cert)

    try {
      if (cert.revoked) {
        setVerificationStatus("revoked")
        return
      }

      const isValid = await verifyCertificate(cert)
      setVerificationStatus(isValid ? "valid" : "invalid")
      if (isValid) {
        setShowSuccessDialog(true)
      }
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationStatus("invalid")
      setError("An error occurred during verification")
    }
  }

  const handleVerifyFromJSON = async () => {
    setError("")
    try {
      const cert = JSON.parse(jsonInput)

      // Validate required fields
      if (!cert.id || !cert.recipientName || !cert.courseName || !cert.signature || !cert.publicKey) {
        setError("Invalid certificate format. Missing required fields.")
        return
      }

      await handleVerifyCertificate(cert)
    } catch (error) {
      setError("Invalid JSON format")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")

    if (!file.name.endsWith(".json")) {
      setError("Please upload a JSON file")
      return
    }

    try {
      const text = await file.text()
      const cert = JSON.parse(text)
      setJsonInput(text)
      await handleVerifyCertificate(cert)
    } catch (error) {
      setError("Failed to read or parse certificate file. Make sure it's a valid JSON certificate.")
    }
  }

  const handleVerifyById = async () => {
    setError("")
    try {
      const { data: cert, error: fetchError } = await getPublicCertificateById(certificateId.trim())

      if (fetchError || !cert) {
        setError("Certificate not found. Please check the ID and try again.")
        return
      }

      const certificate: SignedCertificate = {
        id: cert.id,
        recipientName: cert.recipient_name,
        courseName: cert.course_name,
        issuerName: cert.issuer_name,
        issuerOrganization: cert.issuer_details,
        issueDate: cert.issue_date,
        publicKey: cert.public_key,
        signature: cert.signature,
        logoUrl: cert.logo_url,
        revoked: cert.revoked,
        revokedReason: cert.revoked_reason,
        revokedAt: cert.revoked_at,
        bitcoinTimestamp: cert.bitcoin_timestamp,
      }

      await handleVerifyCertificate(certificate)
    } catch (error) {
      console.error("Failed to verify certificate by ID:", error)
      setError("Failed to verify certificate by ID")
    }
  }

  const handleClearCertificate = () => {
    setCertificate(null)
    setVerificationStatus("idle")
    setJsonInput("")
    setCertificateId("")
    setError("")
    setShowSuccessDialog(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <Link href="/">
          <Button variant="ghost" className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-950 dark:to-blue-950">
              <ShieldCheck className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            Certificate Verification
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Verify the authenticity of DadaDevs certificates using cryptographic signatures and Bitcoin timestamping
          </p>
        </div>

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-950">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl font-bold text-green-900 dark:text-green-100">
                Certificate Authenticated!
              </DialogTitle>
              <DialogDescription asChild>
                <div className="text-center space-y-3 pt-2">
                  <div className="text-base text-slate-700 dark:text-slate-300">
                    This certificate has been cryptographically verified and is{" "}
                    <span className="font-bold text-green-700 dark:text-green-300">100% authentic</span>.
                  </div>
                  {certificate?.bitcoinTimestamp && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <Bitcoin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                        Bitcoin Timestamped
                      </span>
                    </div>
                  )}
                  <div className="pt-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="font-semibold mb-2">Verification Details:</div>
                    <ul className="text-left space-y-1 ml-4">
                      <li>✓ Digital signature verified</li>
                      <li>✓ Issuer identity confirmed</li>
                      <li>✓ Certificate not revoked</li>
                      <li>✓ Data integrity validated</li>
                    </ul>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full bg-green-600 hover:bg-green-700">
              View Certificate
            </Button>
          </DialogContent>
        </Dialog>

        {/* Dialog for invalid certificates */}
        <Dialog open={verificationStatus === "invalid"} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-950">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl font-bold text-red-900 dark:text-red-100">
                Certificate Invalid
              </DialogTitle>
              <DialogDescription asChild>
                <div className="text-center space-y-3 pt-2">
                  <div className="text-base text-slate-700 dark:text-slate-300">
                    This certificate could not be verified and is{" "}
                    <span className="font-bold text-red-700 dark:text-red-300">NOT authentic</span>.
                  </div>
                  <div className="pt-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="font-semibold mb-2">Possible reasons:</div>
                    <ul className="text-left space-y-1 ml-4">
                      <li>• Digital signature does not match</li>
                      <li>• Certificate has been tampered with</li>
                      <li>• Not issued by a valid authority</li>
                      <li>• Certificate data is corrupted</li>
                    </ul>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setVerificationStatus("idle")} className="w-full bg-red-600 hover:bg-red-700">
              Try Another Certificate
            </Button>
          </DialogContent>
        </Dialog>

        {/* Verification Status */}
        {verificationStatus !== "idle" && (
          <Alert
            className={
              verificationStatus === "valid"
                ? "bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-800 border-2"
                : verificationStatus === "revoked"
                  ? "bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800 border-2"
                  : verificationStatus === "invalid"
                    ? "bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-800 border-2"
                    : "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-800 border-2"
            }
          >
            {verificationStatus === "verifying" && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-900 dark:text-blue-100 font-bold">Verifying Certificate...</AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Checking cryptographic signature and revocation status...
                </AlertDescription>
              </>
            )}
            {verificationStatus === "valid" && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100 font-bold flex items-center gap-2">
                  Certificate Valid & Authentic
                  {certificate?.bitcoinTimestamp && (
                    <Badge className="bg-orange-600 hover:bg-orange-700">
                      <Bitcoin className="h-3 w-3 mr-1" />
                      Bitcoin Timestamped
                    </Badge>
                  )}
                </AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  This certificate has been cryptographically verified and is authentic. The signature matches the
                  issuer's public key and the certificate has not been revoked.
                  {certificate?.bitcoinTimestamp && (
                    <span className="block mt-2 font-mono text-xs">
                      Timestamped: {new Date(certificate.bitcoinTimestamp).toLocaleString()}
                    </span>
                  )}
                </AlertDescription>
              </>
            )}
            {verificationStatus === "revoked" && (
              <>
                <Ban className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="text-yellow-900 dark:text-yellow-100 font-bold">Certificate Revoked</AlertTitle>
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  This certificate has been revoked by the issuer and is no longer valid.
                  {certificate?.revokedReason && (
                    <span className="block mt-2 font-semibold">Reason: {certificate.revokedReason}</span>
                  )}
                  {certificate?.revokedAt && (
                    <span className="block mt-1 text-sm">
                      Revoked on: {new Date(certificate.revokedAt).toLocaleString()}
                    </span>
                  )}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-800 border-2">
            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-900 dark:text-red-100 font-bold">Error</AlertTitle>
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {/* Certificate Display */}
        {certificate && verificationStatus === "valid" && (
          <div className="space-y-4">
            <CertificateDisplay certificate={certificate} showQR={false} />
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  const jsonStr = JSON.stringify(certificate, null, 2)
                  const blob = new Blob([jsonStr], { type: "application/json" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `${certificate.id}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-950 bg-transparent text-blue-600 dark:text-blue-400"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button
                onClick={handleClearCertificate}
                variant="outline"
                className="border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-950 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear & Verify Another
              </Button>
            </div>
          </div>
        )}

        {/* Verification Input */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Verify a Certificate
            </CardTitle>
            <CardDescription>
              Enter certificate ID, upload a JSON file, or paste certificate data to verify authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Certificate ID verification option */}
            <div className="space-y-2">
              <Label htmlFor="cert-id-input">Certificate ID</Label>
              <div className="flex gap-2">
                <input
                  id="cert-id-input"
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="CERT-1234567890-ABC123XYZ"
                  className="flex-1 px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <Button
                  onClick={handleVerifyById}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!certificateId.trim()}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Enter the certificate ID found on the certificate
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 dark:text-slate-500">Or</span>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center justify-center w-full h-40 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Drop certificate file here or click to browse
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">Accepts JSON certificate files (.json)</p>
                  </div>
                </div>
                <input id="file-upload" type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </Label>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 dark:text-slate-500">
                  Or paste certificate JSON
                </span>
              </div>
            </div>

            {/* JSON Input */}
            <div className="space-y-2">
              <Label htmlFor="json-input">Certificate JSON Data</Label>
              <Textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"id":"CERT-123...","recipientName":"John Doe","courseName":"Bitcoin Fundamentals","signature":"...","publicKey":"..."}'
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <Button
              onClick={handleVerifyFromJSON}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              disabled={!jsonInput}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verify Certificate
            </Button>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>How Certificate Verification Works</CardTitle>
            <CardDescription>Our multi-layer security approach ensures certificate authenticity</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900 dark:to-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  1
                </span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Digital Signature Verification:{" "}
                  </span>
                  Each certificate is signed using RSA-2048 cryptography with a private key securely held by the issuer.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900 dark:to-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  2
                </span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Public Key Validation: </span>
                  The embedded public key verifies the signature's authenticity without exposing the private key.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900 dark:to-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  3
                </span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Revocation Check: </span>
                  The system checks if the certificate has been revoked by the issuer for any reason.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900 dark:to-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  4
                </span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Bitcoin Timestamping: </span>
                  Certificates can be timestamped to the Bitcoin blockchain for immutable proof of existence at a
                  specific time.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900 dark:to-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  5
                </span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Tamper Detection: </span>
                  Any modification to the certificate data will cause signature verification to fail immediately.
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
