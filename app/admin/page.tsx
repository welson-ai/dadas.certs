"use client"

import type React from "react"
import {
  Key,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Ban,
  Download,
  Eye,
  Bitcoin,
  Upload,
  ArrowLeft,
  ImageIcon,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  generateKeyPair,
  exportPrivateKey,
  exportPublicKey,
  importPrivateKey,
  signCertificate,
  generateCertificateId,
  type CertificateData,
  type SignedCertificate,
} from "@/lib/crypto"
import { saveKeys, getPrivateKey, getPublicKey, clearKeys } from "@/lib/storage"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CertificateDisplay } from "@/components/certificate-display"
import {
  saveCertificateToSupabase,
  getCertificatesByAdmin,
  revokeCertificateInSupabase,
  deleteCertificateFromSupabase,
} from "@/lib/supabase-certificates"
import { createClient } from "@/lib/supabase/client"

export default function AdminPage() {
  const [keysExist, setKeysExist] = useState(false)
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false)
  const [isIssuingCertificate, setIsIssuingCertificate] = useState(false)
  const [certificates, setCertificates] = useState<SignedCertificate[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedCert, setSelectedCert] = useState<SignedCertificate | null>(null)
  const [revokeReason, setRevokeReason] = useState("")
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [viewingCert, setViewingCert] = useState<SignedCertificate | null>(null)
  const [recipientName, setRecipientName] = useState("")
  const [courseName, setCourseName] = useState("")
  const [issuerName, setIssuerName] = useState("")
  const [issuerOrganization, setIssuerOrganization] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [bulkRecipientNames, setBulkRecipientNames] = useState<string[]>(Array(10).fill(""))
  const [bulkCourseName, setBulkCourseName] = useState("")
  const [isBulkIssuing, setIsBulkIssuing] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<"png" | "pdf" | "json" | null>(null)
  const [downloadingCert, setDownloadingCert] = useState<SignedCertificate | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadUserAndCerts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: certs } = await getCertificatesByAdmin(user.id)
        if (certs) {
          const formattedCerts = certs.map((cert) => ({
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
          }))
          setCertificates(formattedCerts as SignedCertificate[])
        }
      }
    }
    loadUserAndCerts()
  }, [])

  const handleGenerateKeys = async () => {
    setIsGeneratingKeys(true)
    try {
      const keyPair = await generateKeyPair()
      const privateKeyPem = await exportPrivateKey(keyPair.privateKey)
      const publicKeyPem = await exportPublicKey(keyPair.publicKey)

      saveKeys(privateKeyPem, publicKeyPem)
      setKeysExist(true)
      setSuccessMessage("Signing keys generated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error generating keys:", error)
      alert("Failed to generate keys")
    } finally {
      setIsGeneratingKeys(false)
    }
  }

  const handleClearKeys = () => {
    if (confirm("Are you sure you want to clear the signing keys? This will invalidate all issued certificates.")) {
      clearKeys()
      setKeysExist(false)
    }
  }

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipientName || !courseName || !userId) {
      alert("Please fill in all required fields")
      return
    }

    setIsIssuingCertificate(true)
    try {
      const privateKeyPem = getPrivateKey()
      const publicKeyPem = getPublicKey()

      if (!privateKeyPem || !publicKeyPem) {
        alert("No signing keys found. Please generate keys first.")
        return
      }

      const privateKey = await importPrivateKey(privateKeyPem)

      const certificateData: CertificateData = {
        id: generateCertificateId(),
        recipientName,
        courseName,
        issueDate: new Date().toISOString(),
        issuerName,
        issuerOrganization,
        logoUrl,
      }

      const signature = await signCertificate(certificateData, privateKey)

      const signedCertificate: SignedCertificate = {
        ...certificateData,
        signature,
        publicKey: publicKeyPem,
      }

      const { error } = await saveCertificateToSupabase(signedCertificate, userId)

      if (error) {
        alert("Failed to save certificate to database")
        return
      }

      const { data: certs } = await getCertificatesByAdmin(userId)
      if (certs) {
        const formattedCerts = certs.map((cert) => ({
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
        }))
        setCertificates(formattedCerts as SignedCertificate[])
      }

      setRecipientName("")
      setCourseName("")
      setLogoUrl("")

      setSuccessMessage(`Certificate issued successfully! ID: ${certificateData.id}`)
      setTimeout(() => setSuccessMessage(""), 5000)
      setDownloadingCert(signedCertificate)
      setDownloadFormat("png")
    } catch (error) {
      console.error("Error issuing certificate:", error)
      alert("Failed to issue certificate")
    } finally {
      setIsIssuingCertificate(false)
    }
  }

  const handleBulkIssueCertificates = async (e: React.FormEvent) => {
    e.preventDefault()

    const names = bulkRecipientNames.filter((name) => name.trim().length > 0)

    if (names.length === 0 || !bulkCourseName || !userId) {
      alert("Please provide at least one recipient name and course name")
      return
    }

    setIsBulkIssuing(true)
    try {
      const privateKeyPem = getPrivateKey()
      const publicKeyPem = getPublicKey()

      if (!privateKeyPem || !publicKeyPem) {
        alert("No signing keys found. Please generate keys first.")
        return
      }

      const privateKey = await importPrivateKey(privateKeyPem)

      let issuedCount = 0
      for (const name of names) {
        const certificateData: CertificateData = {
          id: generateCertificateId(),
          recipientName: name,
          courseName: bulkCourseName,
          issueDate: new Date().toISOString(),
          issuerName,
          issuerOrganization,
          logoUrl,
        }

        const signature = await signCertificate(certificateData, privateKey)

        const signedCertificate: SignedCertificate = {
          ...certificateData,
          signature,
          publicKey: publicKeyPem,
        }

        await saveCertificateToSupabase(signedCertificate, userId)
        issuedCount++
      }

      const { data: certs } = await getCertificatesByAdmin(userId)
      if (certs) {
        const formattedCerts = certs.map((cert) => ({
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
        }))
        setCertificates(formattedCerts as SignedCertificate[])
      }

      setBulkRecipientNames(Array(10).fill(""))
      setBulkCourseName("")
      setLogoUrl("")

      setSuccessMessage(`Successfully issued ${issuedCount} certificates!`)
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error issuing bulk certificates:", error)
      alert("Failed to issue bulk certificates")
    } finally {
      setIsBulkIssuing(false)
    }
  }

  const handleDeleteCertificate = async (id: string) => {
    if (confirm("Are you sure you want to delete this certificate?")) {
      const { error } = await deleteCertificateFromSupabase(id)
      if (!error && userId) {
        const { data: certs } = await getCertificatesByAdmin(userId)
        if (certs) {
          const formattedCerts = certs.map((cert) => ({
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
          }))
          setCertificates(formattedCerts as SignedCertificate[])
        }
      }
    }
  }

  const handleRevokeCertificate = (cert: SignedCertificate) => {
    setSelectedCert(cert)
    setShowRevokeDialog(true)
  }

  const confirmRevoke = async () => {
    if (selectedCert && revokeReason && userId) {
      const { error } = await revokeCertificateInSupabase(selectedCert.id, revokeReason)
      if (!error) {
        const { data: certs } = await getCertificatesByAdmin(userId)
        if (certs) {
          const formattedCerts = certs.map((cert) => ({
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
          }))
          setCertificates(formattedCerts as SignedCertificate[])
        }
      }
      setShowRevokeDialog(false)
      setRevokeReason("")
    }
  }

  const handleViewCertificate = (certificate: SignedCertificate) => {
    setViewingCert(certificate)
  }

  const handleTimestampToBitcoin = (cert: SignedCertificate) => {
    // Placeholder for timestamping logic
    console.log("Timestamping certificate:", cert)
  }

  const handleDownloadCertificate = async (cert: SignedCertificate, format: "png" | "pdf" | "json") => {
    try {
      if (format === "json") {
        const jsonStr = JSON.stringify(cert, null, 2)
        const blob = new Blob([jsonStr], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${cert.id}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const html2canvas = (await import("html2canvas")).default

        const container = document.createElement("div")
        container.style.cssText = `
          position: fixed;
          left: -9999px;
          top: 0;
          width: 1200px;
          min-height: 800px;
          background: linear-gradient(135deg, #ffffff 0%, #fef3c7 30%, #f1f5f9 100%);
          padding: 64px;
          border: 4px solid #f59e0b;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          font-family: system-ui, -apple-system, sans-serif;
        `

        container.innerHTML = `
          <div style="position: relative; z-index: 10;">
            ${
              cert.logoUrl
                ? `<div style="text-align: center; margin-bottom: 32px;">
                <img src="${cert.logoUrl}" alt="Logo" style="height: 64px; width: auto;" crossorigin="anonymous" />
              </div>`
                : ""
            }
            
            <div style="text-align: center; margin-bottom: 32px;">
              <svg style="width: 64px; height: 64px; color: #d97706; display: inline-block;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 014.438 0 3.42 3.42 0 00.806 1.946 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 01-3.138-3.138z"></path>
              </svg>
              <h1 style="font-size: 48px; font-weight: bold; color: #0f172a; margin: 16px 0;">Certificate of Completion</h1>
              <p style="font-size: 20px; color: #b45309; font-weight: 600;">${cert.issuerOrganization}</p>
            </div>

            <div style="text-align: center; padding: 48px 0;">
              <p style="font-size: 18px; color: #475569; margin-bottom: 16px;">This is to certify that</p>
              <p style="font-size: 40px; font-weight: bold; color: #0f172a; margin: 16px 0;">${cert.recipientName}</p>
              <p style="font-size: 18px; color: #475569; margin: 16px 0;">has successfully completed</p>
              <p style="font-size: 32px; font-weight: 600; color: #b45309; margin-top: 16px;">${cert.courseName}</p>
            </div>

            <div style="border-top: 2px solid #e2e8f0; padding-top: 32px; margin-top: 32px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">
                    ${new Date(cert.issueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">Issued by: ${cert.issuerName}</p>
                  <p style="color: #64748b; font-size: 12px; font-family: monospace;">ID: ${cert.id}</p>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <div style="display: inline-block; background-color: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 9999px; font-size: 14px; font-weight: 500;">
                <svg style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Digitally Signed & Verified
              </div>
            </div>
          </div>
        `

        document.body.appendChild(container)

        const canvas = await html2canvas(container, {
          scale: 2,
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
          allowTaint: true,
        })

        document.body.removeChild(container)

        if (format === "png") {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.download = `certificate-${cert.recipientName.replace(/\s+/g, "-")}.png`
              link.href = url
              link.click()
              URL.revokeObjectURL(url)
            }
          })
        } else {
          const jsPDF = (await import("jspdf")).default
          const imgData = canvas.toDataURL("image/png")
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width / 2, canvas.height / 2],
          })
          pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2)
          pdf.save(`certificate-${cert.recipientName.replace(/\s+/g, "-")}.pdf`)
        }
      }
    } catch (error) {
      console.error("[v0] Error downloading certificate:", error)
      alert(`Failed to download certificate: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
    setDownloadFormat(null)
    setDownloadingCert(null)
  }

  const activeCerts = certificates.filter((c) => !c.revoked)
  const revokedCerts = certificates.filter((c) => c.revoked)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Certificate Issuance System
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Admin Dashboard for Bitcoin Dada & DadaDevs</p>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Key Management Section */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-600" />
              Signing Key Management
            </CardTitle>
            <CardDescription>Generate and manage the cryptographic keys used to sign certificates</CardDescription>
          </CardHeader>
          <CardContent>
            {!keysExist ? (
              <div>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No signing keys found. Generate a key pair to start issuing certificates.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleGenerateKeys}
                  disabled={isGeneratingKeys}
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isGeneratingKeys ? "Generating..." : "Generate Signing Keys"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Signing keys are active</span>
                </div>
                <Button onClick={handleClearKeys} variant="destructive" size="sm">
                  Clear Keys
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificate Issuance Forms */}
        {keysExist && (
          <Card className="mb-6 border-2 shadow-lg">
            <CardHeader>
              <CardTitle>Issue Certificates</CardTitle>
              <CardDescription>Create and sign new certificates individually or in bulk</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="single">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="single">Single Certificate</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
                </TabsList>

                <TabsContent value="single">
                  <form onSubmit={handleIssueCertificate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipientName">Recipient Name *</Label>
                        <Input
                          id="recipientName"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="courseName">Course Name *</Label>
                        <Input
                          id="courseName"
                          value={courseName}
                          onChange={(e) => setCourseName(e.target.value)}
                          placeholder="Bitcoin Fundamentals"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="issuerName">Issuer Name</Label>
                        <Input
                          id="issuerName"
                          value={issuerName}
                          onChange={(e) => setIssuerName(e.target.value)}
                          placeholder="Bitcoin Dada"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="issuerOrganization">Organization</Label>
                        <Input
                          id="issuerOrganization"
                          value={issuerOrganization}
                          onChange={(e) => setIssuerOrganization(e.target.value)}
                          placeholder="DadaDevs"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
                        <Input
                          id="logoUrl"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="https://example.com/logo.png"
                          type="url"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Enter a URL to your organization's logo to display on certificates
                        </p>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isIssuingCertificate}
                      size="lg"
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                      {isIssuingCertificate ? "Issuing Certificate..." : "Issue Certificate"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="bulk">
                  <form onSubmit={handleBulkIssueCertificates} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulkCourseName">Course Name *</Label>
                      <Input
                        id="bulkCourseName"
                        value={bulkCourseName}
                        onChange={(e) => setBulkCourseName(e.target.value)}
                        placeholder="Bitcoin Fundamentals"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Recipient Names (up to 10) *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {bulkRecipientNames.map((name, index) => (
                          <div key={index} className="space-y-1">
                            <Input
                              value={name}
                              onChange={(e) => {
                                const newNames = [...bulkRecipientNames]
                                newNames[index] = e.target.value
                                setBulkRecipientNames(newNames)
                              }}
                              placeholder={`Recipient ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-slate-500">
                        {bulkRecipientNames.filter((n) => n.trim()).length} of 10 recipients filled
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bulkLogoUrl">Logo URL (Optional)</Label>
                      <Input
                        id="bulkLogoUrl"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        type="url"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Enter a URL to your organization's logo to display on certificates
                      </p>
                    </div>
                    <Button
                      type="submit"
                      disabled={isBulkIssuing}
                      size="lg"
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isBulkIssuing
                        ? "Issuing Certificates..."
                        : `Issue ${bulkRecipientNames.filter((n) => n.trim()).length} Certificates`}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Issued Certificates Dashboard */}
        {certificates.length > 0 && (
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Certificate Dashboard</span>
                <div className="flex gap-2 text-sm font-normal">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                  >
                    {activeCerts.length} Active
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">
                    {revokedCerts.length} Revoked
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>View and manage all certificates issued from this system</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active Certificates</TabsTrigger>
                  <TabsTrigger value="revoked">Revoked Certificates</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                  <div className="space-y-3">
                    {activeCerts.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No active certificates</p>
                    ) : (
                      activeCerts.map((cert) => (
                        <div
                          key={cert.id}
                          className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-lg border-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900 dark:text-slate-50">{cert.recipientName}</p>
                              {cert.bitcoinTimestamp && (
                                <Badge
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
                                >
                                  <Bitcoin className="h-3 w-3 mr-1" />
                                  Timestamped
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {cert.courseName} • {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-500 mt-1">{cert.id}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleViewCertificate(cert)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              onClick={() => {
                                setDownloadingCert(cert)
                                setDownloadFormat("png")
                              }}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                            {!cert.bitcoinTimestamp && (
                              <Button
                                onClick={() => handleTimestampToBitcoin(cert)}
                                variant="outline"
                                size="sm"
                                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
                              >
                                <Bitcoin className="h-3 w-3" />
                                Timestamp
                              </Button>
                            )}
                            <Button
                              onClick={() => handleRevokeCertificate(cert)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <Ban className="h-3 w-3" />
                              Revoke
                            </Button>
                            <Button
                              onClick={() => handleDeleteCertificate(cert.id)}
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="revoked">
                  <div className="space-y-3">
                    {revokedCerts.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No revoked certificates</p>
                    ) : (
                      revokedCerts.map((cert) => (
                        <div
                          key={cert.id}
                          className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-lg border-2 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900 dark:text-slate-50">{cert.recipientName}</p>
                              <Badge variant="destructive">Revoked</Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{cert.courseName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">ID: {cert.id}</p>
                            {cert.revokedAt && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Revoked: {new Date(cert.revokedAt).toLocaleDateString()} - {cert.revokeReason}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleViewCertificate(cert)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              onClick={() => {
                                setDownloadingCert(cert)
                                setDownloadFormat("png")
                              }}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                            <Button
                              onClick={() => handleDeleteCertificate(cert.id)}
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Certificate Viewer Modal */}
      <Dialog open={!!viewingCert} onOpenChange={(open) => !open && setViewingCert(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
            <DialogDescription>View and download this certificate as PNG or PDF</DialogDescription>
          </DialogHeader>
          {viewingCert && <CertificateDisplay certificate={viewingCert} showQR={true} logoUrl={viewingCert.logoUrl} />}
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Certificate</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this certificate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedCert && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
                <p className="font-medium">{selectedCert.recipientName}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCert.courseName}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="revokeReason">Reason for Revocation *</Label>
              <Textarea
                id="revokeReason"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Enter the reason for revoking this certificate..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRevoke} disabled={!revokeReason}>
              Revoke Certificate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Download Format Selection Dialog */}
      <Dialog open={!!downloadingCert && !!downloadFormat} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Certificate</DialogTitle>
            <DialogDescription>Choose your preferred format</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              onClick={() => downloadingCert && handleDownloadCertificate(downloadingCert, "png")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Download as PNG
            </Button>
            <Button
              onClick={() => downloadingCert && handleDownloadCertificate(downloadingCert, "pdf")}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as PDF
            </Button>
            <Button
              onClick={() => {
                if (downloadingCert) {
                  const jsonStr = JSON.stringify(downloadingCert, null, 2)
                  const blob = new Blob([jsonStr], { type: "application/json" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `${downloadingCert.id}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }
                setDownloadingCert(null)
                setDownloadFormat(null)
              }}
              className="w-full bg-slate-600 hover:bg-slate-700"
              variant="default"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
