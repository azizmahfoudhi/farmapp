# Senya Intelligence Platform - Application Overview

## 1. Executive Summary
Senya is an intelligent, predictive farm management platform designed specifically for olive orchards. Evolving from a simple data-tracking system, Senya acts as a forward-looking decision-support assistant. It not only manages day-to-day operations like expenses and lot tracking but also calculates dynamic health scores and projects future yields, revenues, and risks, empowering farmers to make data-driven decisions.

## 2. Core Architecture & Technologies
- **Frontend Framework:** Next.js (App Router, v16+) with React 19.
- **Styling & UI:** TailwindCSS v4 with a modern, glassmorphic design system featuring rich animations and gradient overlays.
- **State Management:** Zustand for lightweight, global state handling.
- **Database & Backend:** Supabase (PostgreSQL) for secure, real-time data storage and relational management.
- **Data Visualization:** Recharts for responsive, interactive financial and yield area charts.
- **Icons & Typography:** Lucide React for consistent iconography and Next Font (Geist) for optimized typography.

## 3. Key Modules & Features

### 3.1. Farm Configuration & Tracking
- **Global Settings:** Farmers configure their total surface area (ha) and the base selling price per kg of olives.
- **Lot Management:** The farm is divided into 'Lots' (batches of trees). Each lot tracks tree type, planting date, number of trees, irrigation status, and growth state (1-5 stars).
- **Expense Logging:** Financial tracking categorizes expenses into planting, labor, transport, irrigation, equipment, and maintenance.

### 3.2. Intelligence & Health Scoring Engine
The core differentiator of Senya is its custom Intelligence Engine (`intelligence.ts`), which evaluates the farm's performance and outputs a **Health Score (0-100)**. The score is broken down into four key pillars:
- **Yield Performance (30%):** Compares the estimated yield against the theoretical maximum based on tree age and type.
- **Water Efficiency (25%):** Evaluates the irrigation status against the trees' growth state.
- **Financial Efficiency (25%):** Analyzes the margin by comparing current costs against expected revenue.
- **Environmental Stress (20%):** Penalizes the score for recent disease treatments and poor growth indicators.

### 3.3. Predictive Forecasting Module
A robust forecasting engine uses advanced logic (including Gompertz curves for growth estimation) to project the future state of the farm:
- **Lot Forecasts:** Predicts expected yield (kg), expected costs (DT), and net profit for individual lots.
- **Risk Assessment:** Flags potential risks such as negative profitability, extreme sensitivity to water stress, and "alternating bearing" (biennial bearing typical of olive trees).
- **Multi-Year Anticipation:** Projects the farm's financial trajectory up to 10 years into the future, incorporating inflation and yield maturation.

### 3.4. Assistant & Weather Integration
- **Real-Time Dashboard:** The homepage provides an AI-like assistant widget that offers actionable insights based on cross-referencing farm data with live weather conditions (e.g., wind speed, temperature, 5-day forecasts).
- **Smart Recommendations:** Automatically generates warnings or success metrics depending on the farm's health breakdown.

## 4. Data Models & Domain
The application relies on highly structured domain types (`domain.ts`):
- `TreeType`: Defines maximum yield capacities.
- `Batch` (Lot): Contains planting dates and irrigation status.
- `Expense` & `YieldRecord`: Historic and current financial data.
- `FarmTask` & `Treatment`: Operational activities and disease management.
- `Scenario`: Allows farmers to simulate adding lots or changing irrigation systems to foresee financial impact.

## 5. User Interface & Experience
- The platform features a highly polished UI tailored for both desktop and mobile views.
- **Visual Excellence:** Utilizes modern web aesthetics including vibrant status colors (success, warning, danger), backdrop blurs, and dynamic micro-animations.
- **Localization:** The interface is fully localized in French, matching the target demographic.

## 6. Business Value
Senya transitions the agricultural workflow from reactive record-keeping to proactive management. By integrating financial tracking with biological forecasting, it enables olive growers to minimize environmental stress, optimize irrigation budgets, and accurately forecast their multi-year ROI.
