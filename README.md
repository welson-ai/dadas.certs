DadaDevs Certificate System (Bitcoin
Dada)
Live Demo: https://dadadevs-certs.vercel.app/
GitHub Repository: https://github.com/welson-ai/dadadevs-certs

Project Overview
Bitcoin Dada & DadaDevs issue physical certificates. Physical certificates can be forged or
altered. This project provides a digital certificate signature system that:
Prevents forgery
Allows anyone to verify authenticity
Is easy for the team to use
This is the MVP (Minimum Viable Product) version.

Features
Issue digital certificates
Verify authenticity via cryptographic signatures
Deployable on the Scroll network
Lightweight and user-friendly

Tech Stack (v0)
Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express
Blockchain Integration: Scroll network (for signature verification)
Version Control: Git & GitHub

Hosting: Vercel

Folder Structure
dada-devs-certificate-system/
├─ package.json
├─ server.js
├─ publish-nostr.js
├─ README.md
├─ public/
│ ├─ index.html
│ ├─ app.js
│ └─ styles.css
└─ .gitignore

Setup Instructions
Clone the repository:
git clone https://github.com/welson-ai/dadadevs-certs.git

Install dependencies:
npm install

Start the server:
node server.js

Open your browser at http://localhost:3000

Usage
Access the live demo: https://dadadevs-certs.vercel.app/
Issue and verify certificates seamlessly
