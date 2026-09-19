<div align="center">

<h1>🏥 ArogyaNet</h1>
<p><strong>Multi-Role Health Network & Inventory Monitor with GIS Telemetry</strong></p>

<p>
  <img src="https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?style=for-the-badge&logo=google" alt="Gemini AI"/>
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker"/>
</p>

<p>
  A real-time healthcare operations platform connecting <strong>District Medical Officers</strong>, <strong>PHC Workers</strong>, and the <strong>General Public</strong> — enabling live hospital inventory tracking, GIS-based facility discovery, AI-powered logbook scanning, and emergency consignment logistics across Maharashtra.
</p>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Docker Deployment](#-docker-deployment)
- [API Reference](#-api-reference)
- [Future Scope](#-future-scope)

---

## 🌐 Overview

ArogyaNet is a **public health infrastructure management platform** built for India. It addresses a critical gap in India's primary healthcare system: the lack of real-time visibility into medicine stock, bed availability, cold-chain status, and inter-facility logistics.

The platform operates across **three distinct user roles**, each with a tailored dashboard, providing a unified view of district-level health infrastructure — from government district hospitals down to rural primary health centres (PHCs).

---

## ✨ Key Features

### 🗺️ Live GIS Telemetry Map
- Interactive Leaflet map showing all hospitals and PHCs across Maharashtra
- Real-time status indicators: **Active Sync**, **Predictive Stock**, **Blackout**
- Filter hospitals by status type; click markers for full facility details
- Supports 13+ pre-configured Maharashtra location presets and free-text city search

### 🤖 AI-Powered Logbook Scanner *(Gemini 3.6 Flash)*
- Upload a photo of any handwritten or printed medicine logbook
- Gemini Vision API extracts medicine names, quantities, and batch numbers automatically
- Parsed results are injected directly into hospital inventory records
- Reduces manual data entry errors for field PHC workers

### 💊 Critical Medicine & Inventory Tracking
- Per-facility tracking of critical medicines with emergency threshold alerts
- Visual indicators for below-limit stock with urgency levels
- Cold chain unit telemetry: temperature, capacity, and status (`Optimal` / `Warning` / `Critical Outage`)

### 📦 Consignment Requisition Workflow
- PHC Workers raise medicine requisition requests directly to the DMO
- DMOs review, approve, and dispatch consignments with status tracking
- Consignment lifecycle: `Pending Dispatch` → `In Transit` → `Delivered`
- AI-suggested inter-PHC transfers to optimise stock distribution

### 🏥 Hospital Finder for General Public
- Search hospitals by name, specialty, or medicine availability
- Sort by distance using the **Haversine formula** from any Maharashtra location
- View live bed availability: **ICU**, **Oxygen**, and **General** beds
- See on-duty doctors, nurses, specialties, and a Smart Favourability Score

### 🔐 Multi-Role Authentication
- Role-based access: **DMO Portal**, **PHC Worker Portal**, **General Public Portal**
- Badge ID + email authentication for healthcare workers
- Secure session handling via React Context

---

## 👥 User Roles

| Role | Access | Key Capabilities |
|---|---|---|
| **DMO** (District Medical Officer) | DMO Portal | Network-wide map view, critical stock alerts, consignment approval & dispatch, logbook scanning, cold chain monitoring |
| **PHC Worker** | PHC Worker Portal | Facility-level inventory view, raise requisitions to DMO, AI logbook scan, update stock records |
| **General Public** | General User Portal | Find nearest hospitals, filter by specialty/medicine, view bed availability, check favourability scores |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js ](https://nextjs.org) (App Router) |
| **UI Library** | [React 19](https://react.dev) |
| **Language** | [TypeScript 5](https://typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Maps** | [Leaflet](https://leafletjs.com) + [React Leaflet v5](https://react-leaflet.js.org) |
| **AI / Vision** | [Google Gemini 3.6 Flash](https://ai.google.dev) via `@google/genai` |
| **Cloud** | [Google Cloud Run](https://cloud.google.com/run) + [BigQuery](https://cloud.google.com/bigquery) |
| **Containerisation** | [Docker](https://docker.com) (multi-stage, Node 20 Alpine) |

---

## 📁 Project Structure

```text
ArogyaNet/
├── app/
│   ├── api/
│   │   ├── parse-logbook/     # POST: Gemini AI logbook OCR endpoint
│   │   ├── clinics/           # Clinic data API
│   │   └── requisition/       # Requisition management API
│   ├── layout.tsx             # Root layout with font & metadata
│   ├── page.tsx               # Main entry — role-aware dashboard router
│   └── globals.css            # Global styles
│
├── components/
│   ├── ArogyaMap.tsx          # Map wrapper (SSR-safe dynamic import)
│   ├── ArogyaMapInner.tsx     # Core Leaflet map with markers & popups
│   ├── AuthModal.tsx          # Login / register modal for all roles
│   ├── DmoDashboard.tsx       # DMO command centre dashboard
│   ├── GeneralUserDashboard.tsx  # Public hospital finder & search
│   ├── LogbookScannerModal.tsx   # AI logbook scan UI & Gemini integration
│   ├── PhcWorkerDashboard.tsx    # PHC worker stock & requisition panel
│   ├── RequisitionModal.tsx      # Consignment requisition form modal
│   └── RoleSelectorModal.tsx     # Role & portal selection modal
│
├── context/
│   └── AuthContext.tsx        # Global auth state (role, user, modals)
│
├── data/
│   └── hospitalsData.ts       # Hospital data models, mock data & location presets
│
├── public/                    # Static assets
├── Dockerfile                 # Multi-stage production Docker build
├── next.config.ts             # Next.js configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or later
- **npm** v10 or later
- A **Google Gemini API Key** (for the AI logbook scanner)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/ArogyaNet.git
cd ArogyaNet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#-environment-variables) below).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required: Google Gemini API Key for AI logbook scanning
GEMINI_API_KEY="your-gemini-api-key-here"

# Required: Google Cloud Project ID (for BigQuery and Cloud Run)
GOOGLE_CLOUD_PROJECT_ID="your-gcp-project-id"
```

> **Note:** Never commit your `.env` file. It is already listed in `.gitignore`.

To obtain a Gemini API key, visit [Google AI Studio](https://aistudio.google.com/app/apikey).

---



## 🔭 Future Scope

- **Predictive Stock Forecasting** — ML models to anticipate medicine shortages 7–14 days ahead
- **IoT Cold Chain Sensors** — Live temperature telemetry from physical refrigerators via LoRa/Bluetooth
- **Native Mobile App** — Android/iOS app for ASHA & ANM workers with offline-first support
- **WhatsApp / SMS Alerts** — Push critical stock alerts to field workers on any phone
- **ABHA Integration** — Link patient health records via Ayushman Bharat Health Account
- **National NHM Integration** — Expand beyond Maharashtra to all 36 states via NHM data exchange
- **Ambulance GPS Tracking** — Real-time consignment vehicle tracking on the ArogyaMap
- **Blockchain Consignment Ledger** — Immutable audit trail for high-value medicine dispatches

---

## 📄 License

This project is developed for healthcare public good. For licensing enquiries, please contact the project maintainers.

---

<div align="center">
  <p>Built with ❤️ for India's public health infrastructure</p>
  <p><strong>ArogyaNet</strong> — Connecting every PHC, every doctor, every patient.</p>
</div>
