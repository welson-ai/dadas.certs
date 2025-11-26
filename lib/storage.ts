// Client-side storage utilities for certificates and keys

import type { SignedCertificate } from "./crypto"

const CERTIFICATES_KEY = "dadadevs_certificates"
const PRIVATE_KEY_KEY = "dadadevs_private_key"
const PUBLIC_KEY_KEY = "dadadevs_public_key"
const REVOKED_CERTIFICATES_KEY = "dadadevs_revoked_certificates"

// Certificate storage
export function saveCertificate(certificate: SignedCertificate): void {
  const certificates = getAllCertificates()
  certificates.push(certificate)
  localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates))
}

export function getAllCertificates(): SignedCertificate[] {
  const data = localStorage.getItem(CERTIFICATES_KEY)
  return data ? JSON.parse(data) : []
}

export function getCertificateById(id: string): SignedCertificate | null {
  const certificates = getAllCertificates()
  return certificates.find((cert) => cert.id === id) || null
}

export function deleteCertificate(id: string): void {
  const certificates = getAllCertificates()
  const filtered = certificates.filter((cert) => cert.id !== id)
  localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(filtered))
}

export function revokeCertificate(id: string, reason: string): void {
  const certificates = getAllCertificates()
  const updated = certificates.map((cert) =>
    cert.id === id ? { ...cert, revoked: true, revokedAt: new Date().toISOString(), revokedReason: reason } : cert,
  )
  localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(updated))
}

export function isRevoked(id: string): boolean {
  const certificate = getCertificateById(id)
  return certificate?.revoked || false
}

export function updateCertificate(id: string, updates: Partial<SignedCertificate>): void {
  const certificates = getAllCertificates()
  const updated = certificates.map((cert) => (cert.id === id ? { ...cert, ...updates } : cert))
  localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(updated))
}

// Key storage
export function saveKeys(privateKey: string, publicKey: string): void {
  localStorage.setItem(PRIVATE_KEY_KEY, privateKey)
  localStorage.setItem(PUBLIC_KEY_KEY, publicKey)
}

export function getPrivateKey(): string | null {
  return localStorage.getItem(PRIVATE_KEY_KEY)
}

export function getPublicKey(): string | null {
  return localStorage.getItem(PUBLIC_KEY_KEY)
}

export function hasKeys(): boolean {
  return !!getPrivateKey() && !!getPublicKey()
}

export function clearKeys(): void {
  localStorage.removeItem(PRIVATE_KEY_KEY)
  localStorage.removeItem(PUBLIC_KEY_KEY)
}
