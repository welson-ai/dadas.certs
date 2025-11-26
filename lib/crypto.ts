// Cryptographic utilities for certificate signing and verification

export interface CertificateData {
  id: string
  recipientName: string
  courseName: string
  issueDate: string
  issuerName: string
  issuerOrganization: string
  logoUrl?: string
}

export interface SignedCertificate extends CertificateData {
  signature: string
  publicKey: string
  revoked?: boolean
  revokedAt?: string
  revokedReason?: string
  bitcoinTimestamp?: string
  opentimestampsProof?: string
}

// Generate a new key pair for signing certificates
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  )
}

// Export public key to PEM format
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key)
  const exportedAsString = arrayBufferToBase64(exported)
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsString}\n-----END PUBLIC KEY-----`
}

// Export private key to PEM format
export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", key)
  const exportedAsString = arrayBufferToBase64(exported)
  return `-----BEGIN PRIVATE KEY-----\n${exportedAsString}\n-----END PRIVATE KEY-----`
}

// Import public key from PEM format
export async function importPublicKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "")
  const binaryDer = base64ToArrayBuffer(pemContents)

  return await crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["verify"],
  )
}

// Import private key from PEM format
export async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "")
  const binaryDer = base64ToArrayBuffer(pemContents)

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["sign"],
  )
}

// Sign certificate data
export async function signCertificate(certificateData: CertificateData, privateKey: CryptoKey): Promise<string> {
  const dataString = JSON.stringify(certificateData)
  const encoder = new TextEncoder()
  const data = encoder.encode(dataString)

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, data)

  return arrayBufferToBase64(signature)
}

// Verify certificate signature
export async function verifyCertificate(certificate: SignedCertificate): Promise<boolean> {
  try {
    const { signature, publicKey, ...certificateData } = certificate
    const dataString = JSON.stringify(certificateData)
    const encoder = new TextEncoder()
    const data = encoder.encode(dataString)

    const signatureBuffer = base64ToArrayBuffer(signature)
    const key = await importPublicKey(publicKey)

    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signatureBuffer, data)
  } catch (error) {
    console.error("Verification error:", error)
    return false
  }
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

// Generate a unique certificate ID
export function generateCertificateId(): string {
  return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

// Generate a SHA-256 hash for Bitcoin timestamping
export async function generateCertificateHash(certificate: SignedCertificate): Promise<string> {
  const dataString = JSON.stringify({
    id: certificate.id,
    recipientName: certificate.recipientName,
    courseName: certificate.courseName,
    issueDate: certificate.issueDate,
    signature: certificate.signature,
  })
  const encoder = new TextEncoder()
  const data = encoder.encode(dataString)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return arrayBufferToHex(hashBuffer)
}

// Helper to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
