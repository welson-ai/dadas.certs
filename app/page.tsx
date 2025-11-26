"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, ShieldCheck, Lock, Bitcoin, Upload, Ban, List } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-950 dark:to-blue-950">
              <Award className="h-20 w-20 text-amber-600 dark:text-amber-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-blue-600 bg-clip-text text-transparent text-balance leading-tight">
            Digital Certificate Signature System
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-balance max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade cryptographically signed certificates for Bitcoin Dada & DadaDevs. Secure, verifiable, and
            timestamped to Bitcoin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              asChild
              className="px-8 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
            >
              <Link href="/admin">Issue Certificates</Link>
            </Button>
            <Button asChild variant="outline" className="px-8 bg-transparent border-2">
              <Link href="/verify">Verify Certificate</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Enterprise Features
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Professional certificate management with advanced security and verification capabilities
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Lock className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-2" />
                <CardTitle>RSA-2048 Encryption</CardTitle>
                <CardDescription>
                  Military-grade cryptographic signatures ensure certificates cannot be forged or tampered with
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Bitcoin className="h-10 w-10 text-orange-600 dark:text-orange-400 mb-2" />
                <CardTitle>Bitcoin Timestamping</CardTitle>
                <CardDescription>
                  Anchor certificates to the Bitcoin blockchain via OpenTimestamps for immutable proof of existence
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <ShieldCheck className="h-10 w-10 text-green-600 dark:text-green-400 mb-2" />
                <CardTitle>Instant Verification</CardTitle>
                <CardDescription>
                  Upload certificate files or scan QR codes to verify authenticity in seconds with full revocation
                  checking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Upload className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-2" />
                <CardTitle>Bulk Generation</CardTitle>
                <CardDescription>
                  Issue hundreds of certificates at once with our bulk generation system for large cohorts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Ban className="h-10 w-10 text-red-600 dark:text-red-400 mb-2" />
                <CardTitle>Certificate Revocation</CardTitle>
                <CardDescription>
                  Revoke certificates instantly with reason tracking for complete lifecycle management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <List className="h-10 w-10 text-amber-600 dark:text-amber-400 mb-2" />
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive dashboard to view, manage, and track all issued certificates in one place
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 bg-white dark:bg-slate-950 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">How It Works</CardTitle>
              <CardDescription className="text-base">Simple and secure certificate issuance process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900 dark:to-blue-950 text-blue-700 dark:text-blue-300 font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">Generate Key Pair</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Admin generates a cryptographic key pair (RSA-2048 private and public keys) for signing
                      certificates securely
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900 dark:to-blue-950 text-blue-700 dark:text-blue-300 font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">Issue Certificates</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Create individual or bulk certificates with student details. Each gets a unique digital signature
                      and QR code
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900 dark:to-blue-950 text-blue-700 dark:text-blue-300 font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                      Bitcoin Timestamp (Optional)
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Anchor certificate hashes to Bitcoin blockchain via OpenTimestamps for immutable proof of
                      existence
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900 dark:to-blue-950 text-blue-700 dark:text-blue-300 font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">Verify Anytime</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Anyone can verify certificates by uploading the JSON file, scanning QR codes, or using
                      verification URLs
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6 p-8 md:p-12 bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-950 dark:to-blue-950 rounded-2xl border-2 border-orange-200 dark:border-orange-800">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">
            Ready to Issue Secure Certificates?
          </h2>
          <p className="text-base text-slate-700 dark:text-slate-300">
            Start issuing cryptographically signed, Bitcoin-timestamped certificates today
          </p>
          <Button
            asChild
            className="px-8 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
          >
            <Link href="/admin">Get Started Now</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-slate-200 dark:border-slate-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-base mb-1">Bitcoin Dada & DadaDevs</p>
            <p className="text-sm">Enterprise Digital Certificate Signature System</p>
            <p className="text-xs mt-2">Secured by RSA-2048 Cryptography & Bitcoin Blockchain</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
