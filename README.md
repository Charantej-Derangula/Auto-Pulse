# AutoPulse 🚗⚡
> **AI-Powered Vehicle Health, Diagnosis & Maintenance Intelligence Platform**
> *"Don't wait for your car to fail. Know what it needs before it does."*

[![Vite](https://img.shields.io/badge/Vite-React-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Tailwind-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 What is AutoPulse?

Vehicle owners often struggle to understand the actual condition of their vehicle, identify potential problems, maintain service records, track expenses, and remember upcoming maintenance requirements.

**AutoPulse** is an intelligent vehicle-care platform that brings vehicle health monitoring, AI-assisted diagnosis, maintenance planning, service history, expenses, documents, reminders, and garage discovery into a single application.

Instead of managing vehicle information across different apps, documents, and service centers, AutoPulse provides a centralized digital profile for every vehicle.

### Core Capabilities

1. **🤖 AI Vehicle Diagnosis**
   - Users can describe symptoms or vehicle problems.
   - AutoPulse analyzes the provided issue and generates a structured diagnosis.
   - Displays severity level, possible causes, recommended actions, estimated repair cost, and workshop time where supported.
   - Diagnosis history is maintained for the selected vehicle.

2. **❤️ Vehicle Health Score**
   - Generates an estimated vehicle-health score using available vehicle information, maintenance/service records, diagnostic results, and other supported parameters.
   - Health is represented as a derived estimate rather than claiming access to real-time physical vehicle sensors.
   - Helps users understand whether their vehicle requires attention.

3. **🚗 Vehicle Profile Management**
   - Maintains individual vehicle profiles using a unique `vehicleId`.
   - Stores vehicle make, model, model year, chassis/VIN, engine number, registration information, odometer, fuel type, and other supported specifications.
   - Vehicle identity remains separate from its service, expense, diagnosis, and document history.

4. **🛠️ Service & Maintenance Management**
   - Tracks scheduled maintenance milestones.
   - Allows users to book upcoming services.
   - Add service logs and maintenance records.
   - Tracks completed services separately from future bookings.
   - Maintains vehicle-specific service history.

5. **💰 Expense Tracking**
   - Allows users to record vehicle-related expenses.
   - Helps monitor maintenance and ownership costs.
   - Expenses remain associated with the correct vehicle.

6. **🔧 Garage Discovery**
   - Provides a garage-search interface for discovering available/verified service locations.
   - Supports location-based searching where the required service/API is available.
   - Does not claim unverified garages as real verified workshops.

7. **📄 Vehicle Documents**
   - Centralized access to vehicle-related documents.
   - Documents remain associated with the selected vehicle.

8. **🔔 Maintenance Reminders**
   - Helps users track upcoming service and maintenance requirements.
   - Supports vehicle-specific reminders.

9. **🚘 Exact Vehicle Image & Identity Matching**
   - Vehicle images are resolved from the actual make + model.
   - Examples:
     - Hyundai Creta → Hyundai Creta image
     - Hyundai Venue → Hyundai Venue image
     - Tata Nexon → Tata Nexon image
     - Mahindra XUV700 → Mahindra XUV700 image
     - Toyota Fortuner → Toyota Fortuner image
     - Honda City → Honda City image
   - A neutral placeholder is used when an exact vehicle image is unavailable instead of displaying a misleading vehicle.

10. **💾 Vehicle-Specific Data Persistence**
    - Service history, expenses, diagnoses, documents, reminders, and maintenance records are associated with the selected `vehicleId`.
    - Changing vehicle details or images does not mix or delete historical records belonging to another vehicle.

---

## 🚀 Quick Start Instructions

```bash
# 1. Enter project directory
cd autopulse

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev