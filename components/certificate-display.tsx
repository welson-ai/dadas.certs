"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SignedCertificate } from "@/lib/crypto"
import { Award, Calendar, Building2, User, Bitcoin, Ban, Download, ImageIcon } from "lucide-react"
import { TimestampInfo } from "./timestamp-info"

interface CertificateDisplayProps {
  certificate: SignedCertificate
  showQR?: boolean
  qrCodeUrl?: string
  logoUrl?: string
}

export function CertificateDisplay({ certificate, showQR = true, qrCodeUrl, logoUrl }: CertificateDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const certificateRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [generatedQrUrl, setGeneratedQrUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = qrCodeUrl || `${window.location.origin}/verify?id=${encodeURIComponent(certificate.id)}`
      setGeneratedQrUrl(url)
      console.log("[v0] Generated QR URL:", url)
    }
  }, [qrCodeUrl, certificate.id])

  useEffect(() => {
    if (showQR && generatedQrUrl && canvasRef.current) {
      console.log("[v0] Generating QR code for:", generatedQrUrl)
      import("qrcode").then((QRCode) => {
        QRCode.toCanvas(canvasRef.current, generatedQrUrl, {
          width: 150,
          margin: 2,
          color: {
            dark: "#1e293b",
            light: "#ffffff",
          },
        })
          .then(() => {
            console.log("[v0] QR code generated successfully")
          })
          .catch((err) => {
            console.error("[v0] QR code generation error:", err)
          })
      })
    }
  }, [generatedQrUrl, showQR])

  const createPlainCertificate = () => {
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
          logoUrl
            ? `<div style="text-align: center; margin-bottom: 32px;">
            <img src="${logoUrl}" alt="Logo" style="height: 64px; width: auto;" crossorigin="anonymous" />
          </div>`
            : ""
        }
        
        <div style="text-align: center; margin-bottom: 32px;">
          <svg style="width: 64px; height: 64px; color: #d97706; display: inline-block;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 014.438 0 3.42 3.42 0 00.806-.806 3.42 3.42 0 013.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 01-3.138-3.138z"></path>
          </svg>
          <h1 style="font-size: 48px; font-weight: bold; color: #0f172a; margin: 16px 0;">Certificate of Completion</h1>
          <p style="font-size: 20px; color: #b45309; font-weight: 600;">${certificate.issuerOrganization}</p>
        </div>

        <div style="text-align: center; padding: 48px 0;">
          <p style="font-size: 18px; color: #475569; margin-bottom: 16px;">This is to certify that</p>
          <p style="font-size: 40px; font-weight: bold; color: #0f172a; margin: 16px 0;">${certificate.recipientName}</p>
          <p style="font-size: 18px; color: #475569; margin: 16px 0;">has successfully completed</p>
          <p style="font-size: 32px; font-weight: 600; color: #b45309; margin-top: 16px;">${certificate.courseName}</p>
        </div>

        <div style="border-top: 2px solid #e2e8f0; padding-top: 32px; margin-top: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">
                ${new Date(certificate.issueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">Issued by: ${certificate.issuerName}</p>
              <p style="color: #64748b; font-size: 12px; font-family: monospace;">ID: ${certificate.id}</p>
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

    return container
  }

  const downloadAsPNG = async () => {
    setIsDownloading(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const container = createPlainCertificate()
      document.body.appendChild(container)

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      document.body.removeChild(container)

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.download = `certificate-${certificate.recipientName.replace(/\s+/g, "-")}.png`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }
      })
    } catch (error) {
      console.error("Error generating PNG:", error)
      alert(`Failed to generate PNG: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsDownloading(false)
    }
  }

  const downloadAsPDF = async () => {
    setIsDownloading(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default
      const container = createPlainCertificate()
      document.body.appendChild(container)

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      document.body.removeChild(container)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      })

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`certificate-${certificate.recipientName.replace(/\s+/g, "-")}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsDownloading(false)
    }
  }

  if (certificate.revoked) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-slate-50 dark:from-red-950/30 dark:to-slate-950 p-8 md:p-12 border-4 border-red-500 shadow-2xl">
        <div className="relative z-10 space-y-6 text-center">
          <div className="flex justify-center">
            <Ban className="h-16 w-16 text-red-600 dark:text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-500">Certificate Revoked</h1>
          <p className="text-xl text-slate-700 dark:text-slate-300">
            This certificate has been revoked and is no longer valid.
          </p>
          {certificate.revokedReason && (
            <div className="p-4 bg-red-100 dark:bg-red-950/50 rounded-lg">
              <p className="font-semibold text-red-900 dark:text-red-200">Reason:</p>
              <p className="text-red-800 dark:text-red-300">{certificate.revokedReason}</p>
            </div>
          )}
          {certificate.revokedAt && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Revoked on: {new Date(certificate.revokedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={downloadAsPNG} variant="outline" className="gap-2 bg-transparent" disabled={isDownloading}>
          <ImageIcon className="h-4 w-4" />
          {isDownloading ? "Generating..." : "Download as PNG"}
        </Button>
        <Button onClick={downloadAsPDF} variant="outline" className="gap-2 bg-transparent" disabled={isDownloading}>
          <Download className="h-4 w-4" />
          {isDownloading ? "Generating..." : "Download as PDF"}
        </Button>
      </div>

      <Card
        ref={certificateRef}
        className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-slate-50 dark:from-slate-900 dark:via-amber-950/10 dark:to-slate-950 p-8 md:p-16 border-4 border-amber-500 shadow-2xl min-w-[900px]"
      >
        <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-amber-500 opacity-20" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-amber-500 opacity-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-amber-500 opacity-20" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-amber-500 opacity-20" />

        <div className="relative z-10 space-y-8">
          {logoUrl && (
            <div className="flex justify-center mb-4">
              <img
                src={logoUrl || "/placeholder.svg"}
                alt="DadaDevs Logo"
                className="h-16 w-auto object-contain"
                crossOrigin="anonymous"
              />
            </div>
          )}
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <Award className="h-16 w-16" style={{ color: "#d97706" }} />
              {certificate.bitcoinTimestamp && (
                <Badge className="text-white" style={{ backgroundColor: "#ea580c" }}>
                  <Bitcoin className="h-4 w-4 mr-1" />
                  Bitcoin Timestamped
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance" style={{ color: "#0f172a" }}>
              Certificate of Completion
            </h1>
            <div className="flex items-center justify-center gap-2" style={{ color: "#b45309" }}>
              <Building2 className="h-5 w-5" />
              <p className="text-xl font-semibold">{certificate.issuerOrganization}</p>
            </div>
          </div>

          <div className="text-center space-y-3 py-6">
            <p className="text-lg" style={{ color: "#475569" }}>
              This is to certify that
            </p>
            <p className="text-3xl md:text-4xl font-bold text-balance" style={{ color: "#0f172a" }}>
              {certificate.recipientName}
            </p>
            <p className="text-lg" style={{ color: "#475569" }}>
              has successfully completed
            </p>
            <p className="text-2xl md:text-3xl font-semibold text-balance" style={{ color: "#b45309" }}>
              {certificate.courseName}
            </p>
          </div>

          <div
            className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t-2"
            style={{ borderColor: "#e2e8f0" }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2" style={{ color: "#475569" }}>
                <Calendar className="h-4 w-4" />
                <p className="text-sm">
                  {new Date(certificate.issueDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2" style={{ color: "#475569" }}>
                <User className="h-4 w-4" />
                <p className="text-sm">Issued by: {certificate.issuerName}</p>
              </div>
              <p className="text-xs font-mono" style={{ color: "#64748b" }}>
                ID: {certificate.id}
              </p>
            </div>

            {showQR && generatedQrUrl && (
              <div className="flex flex-col items-center gap-2">
                <canvas ref={canvasRef} className="border-2 rounded" style={{ borderColor: "#e2e8f0" }} />
                <p className="text-xs text-center" style={{ color: "#64748b" }}>
                  Scan to verify
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: "#dcfce7", color: "#166534" }}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Digitally Signed & Verified
            </div>
          </div>
        </div>
      </Card>

      {certificate.bitcoinTimestamp && (
        <TimestampInfo timestamp={certificate.bitcoinTimestamp} proof={certificate.opentimestampsProof} />
      )}
    </div>
  )
}
