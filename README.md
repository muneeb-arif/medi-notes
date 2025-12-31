# MediNotes

A modern, patient-centric mobile application designed to consolidate medical records, family health information, vitals, medications, appointments, and emergency details into a single, secure, easy-to-share digital profile.

## Screenshots

![Home Screen](./screenshots/home-screen.png)
*Home screen showing dashboard with recent appointments, vitals, and medications*

![Profiles Screen](./screenshots/profiles-screen.png)
*Profile management screen for creating and managing multiple family member profiles*

![Appointments Screen](./screenshots/appointments-screen.png)
*Appointments list with upcoming and past appointments*

![Vitals Screen](./screenshots/vitals-screen.png)
*Vitals tracking screen with charts and historical data*

![Reports Screen](./screenshots/reports-screen.png)
*Medical reports management with PDF viewing capabilities*

![Settings Screen](./screenshots/settings-screen.png)
*Settings screen with account management and preferences*

## About

MediNote empowers patients with complete ownership of their medical history while providing doctors with well-organized, consent-based access to essential information. The app supports multi-profile health management (self + family), condition-specific sub-profiles, doctor collaboration, consent management, secure report sharing, and future-ready AI-driven healthcare assistance.

### Key Objectives

- Provide patients a single source of truth for medical records
- Enable families to manage all members' health data in one app
- Create emergency-ready information accessible with patient consent
- Enable structured report management (PDFs, images, prescriptions)
- Provide rich health insights through vitals, trends, and summaries
- Enable sharing with doctors via secure links, QR, and controlled access tokens

### Target Users

- **Primary Users**: Patients tracking their own health and family caregivers managing multiple dependent profiles
- **Secondary Users**: Doctors reviewing patient-provided information and clinics receiving structured health info

## Features

### Profile Management
- Create unlimited person-level profiles
- Add/edit demographics, emergency contacts, medical identity
- Manage condition-level sub-profiles (General, Cardiology, Psychology, etc.)

### Medical Records
- Upload/view lab reports, prescriptions, radiology files, doctor notes
- Store structured metadata per report (type, category, tags, doctor, date)
- Secure and encrypted storage
- View PDFs and images inside app

### Vitals & Health Logs
- Add daily/periodic readings: Blood Pressure, Glucose, Heart Rate, Temperature, Weight, SpO2
- Visual charts and historical trends
- Quick insights and alerts

### Medications Management
- Track active, past, daily, weekly, SOS medications
- Store dosage, frequency, updated logs
- Reminders and irregular patterns tracking

### Appointments
- Schedule and manage medical appointments
- Track upcoming and past appointments
- Store appointment details (doctor, facility, location, notes)

### Emergency Profile
- Display only critical information:
  - Allergies
  - Chronic conditions
  - Key medications
  - Implants/devices
  - Risk flags
  - ICE contacts
- Accessible through toggle-controlled emergency mode

### Consent & Sharing
- Generate temporary access tokens for doctors
- Share via QR, WhatsApp, secure links
- Access logs to view who accessed what and when

## Tech Stack

### Frontend
- **Framework**: Expo ~54.0.25 + React Native 0.81.5
- **Language**: TypeScript 5.9.2
- **Navigation**: React Navigation 7.x
- **State Management**: 
  - Zustand 5.0.9 (client/UI state)
  - React Query 5.90.12 (server state)
- **Forms**: React Hook Form 7.68.0 + Zod 4.2.1
- **Storage**: Expo Secure Store
- **Date/Time Pickers**: @react-native-community/datetimepicker

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Language**: TypeScript 5.9.3
- **Database**: PostgreSQL with TypeORM 0.3.20
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Validation**: Zod 4.2.1
- **Security**: Helmet, CORS
- **Documentation**: Swagger/OpenAPI

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **iOS Simulator** (macOS only) or **Android Emulator** (optional, can use physical device)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd medi-notes
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Database Setup

1. Create a PostgreSQL database:
```bash
createdb medinote
# Or using psql:
# psql -U postgres
# CREATE DATABASE medinote;
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Update `.env` with your database credentials:
```env
PORT=3000
API_PREFIX=/api/v1
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CORS_ORIGIN=*
DATABASE_URL=postgresql://localhost:5432/medinote
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=medinote
TEST_OTP=00000
APP_ENV=dev
```

#### Run Migrations

```bash
npm run migration:run
```

This will create all necessary database tables.

#### Start Backend Server

```bash
npm run dev
```

The backend server will start on `http://localhost:3000`. API documentation is available at `http://localhost:3000/api/docs`.

### 3. Frontend Setup

#### Install Dependencies

```bash
# From project root
npm install
```

#### Configure API URL

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Update `app.json` or `.env` with your backend API URL:
```json
{
  "expo": {
    "extra": {
      "apiBaseURL": "http://YOUR_IP_ADDRESS:3000/api/v1"
    }
  }
}
```

**Important**: Replace `YOUR_IP_ADDRESS` with your machine's local IP address (not `localhost`). Find it using:
- macOS/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`

#### Start Expo Development Server

```bash
npm start
```

This will open the Expo DevTools. You can then:
- Press `i` to open iOS Simulator (macOS only)
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your physical device

## Running the Application

### Backend

```bash
cd backend

# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

### Frontend

```bash
# From project root

# Start Expo
npm start

# Start for specific platform
npm run ios      # iOS Simulator (macOS only)
npm run android  # Android Emulator
npm run web      # Web browser
```

### Mobile Device Setup

1. Install **Expo Go** app on your iOS or Android device
2. Ensure your device and computer are on the same Wi-Fi network
3. Start the Expo development server: `npm start`
4. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Project Structure

```
medi-notes/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, appointments, etc.)
│   │   ├── database/       # Database entities and migrations
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── package.json
├── src/                     # Frontend mobile app
│   ├── features/           # Feature-based modules
│   │   ├── appointments/
│   │   ├── auth/
│   │   ├── profiles/
│   │   ├── vitals/
│   │   └── ...
│   ├── components/         # Shared UI components
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API client and services
│   ├── store/             # Zustand stores
│   └── theme/             # Design tokens
├── docs/                   # Project documentation
│   ├── architecture.md
│   ├── security-compliance.md
│   ├── SRS-functional.md
│   └── ...
├── assets/                 # Images, fonts, icons
└── package.json
```

For detailed project structure, see [docs/project-structure.md](./docs/project-structure.md).

## Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[Architecture](./docs/architecture.md)** - System architecture and design decisions
- **[Security & Compliance](./docs/security-compliance.md)** - Security policies and PHI handling
- **[Functional Requirements](./docs/SRS-functional.md)** - Detailed feature specifications
- **[API Contract](./docs/api-contract.md)** - Backend API endpoints and schemas
- **[Coding Standards](./docs/coding-standards.md)** - Code style and best practices
- **[Development Checklist](./docs/development-checklist.md)** - Development workflow

See [docs/README.md](./docs/README.md) for the complete documentation index.

## Environment Variables

### Backend (.env)

See `backend/env.example` for all required environment variables.

### Frontend

The frontend uses `app.json` for configuration. Update the `apiBaseURL` in the `extra` section with your backend server's IP address.

## Database Migrations

### Create a new migration

```bash
cd backend
npm run migration:generate -- -n MigrationName
```

### Run migrations

```bash
npm run migration:run
```

### Revert last migration

```bash
npm run migration:revert
```

## Troubleshooting

### Backend Issues

- **Database connection errors**: Verify PostgreSQL is running and credentials in `.env` are correct
- **Port already in use**: Change `PORT` in `.env` or stop the process using port 3000
- **Migration errors**: Ensure database exists and user has proper permissions

### Frontend Issues

- **Cannot connect to backend**: 
  - Verify backend is running on the expected port
  - Check `apiBaseURL` in `app.json` uses your machine's IP (not `localhost`)
  - Ensure device and computer are on the same network
- **Expo Go connection issues**: Try restarting Expo server or clearing cache: `expo start -c`

## Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets in production
- Ensure PostgreSQL is properly secured
- Review [security-compliance.md](./docs/security-compliance.md) for PHI handling guidelines

## License

[Add your license information here]

## Contributing

[Add contributing guidelines here if applicable]

