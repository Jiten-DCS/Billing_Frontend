# Billing System Frontend

![React](https://img.shields.io/badge/React-18.3.1-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-06B6D4)
![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF)

A modern, responsive frontend for a billing management system built with React, Tailwind CSS, and Radix UI components.

## Features

- **Authentication System**

  - JWT token storage in localStorage
  - Protected routes
  - Login/Register flows

- **Dashboard**

  - Overview statistics
  - Recent transactions
  - Quick actions

- **Billing Management**

  - Create and manage invoices
  - Generate quotations
  - Track payments

- **Inventory Control**

  - Product catalog
  - Stock management
  - Bulk import/export

- **Customer Management**

  - Customer database
  - Contact information
  - Transaction history

- **Reporting**
  - Sales analytics
  - Product performance
  - Financial summaries

## Tech Stack

### Core Technologies

- ⚛️ React 18
- 🚀 Vite (Build tool)
- 🎨 Tailwind CSS (Utility-first CSS)
- � TypeScript

### UI Components

- 🛠️ Radix UI (Primitives)
- ✨ ShadCN UI (Component library)
- 🎯 Lucide Icons
- 📅 React Day Picker (Date picker)
- 📊 Recharts (Data visualization)

### State & Forms

- 🏗️ React Hook Form (Form management)
- 🛡️ Zod (Schema validation)
- 🔄 TanStack Query (Data fetching)

### Utilities

- 📦 Axios (HTTP client)
- 💾 FileSaver (File downloads)
- 🔔 Sonner (Toasts)
- 📅 date-fns (Date utilities)

## Project Structure

src/
├── assets/ # Static assets
├── components/ # Reusable components
│ ├── ui/ # ShadCN components
│ └── ... # Custom components
├── contexts/ # React contexts
├── hooks/ # Custom hooks
├── lib/ # Utility functions
├── pages/ # Route components
│ ├── auth/ # Authentication pages
│ ├── dashboard/ # Main dashboard
│ ├── invoices/ # Invoice management
│ └── ... # Other feature pages
├── providers/ # App providers
├── routes/ # Routing configuration
├── services/ # API services
├── stores/ # State management
├── types/ # TypeScript types
└── utils/ # Utility functions

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install

   npm run dev

   Building for Production
   npm run build

   Authentication Flow
   The application uses JWT tokens stored in localStorage for authentication:
   ```

User logs in with credentials

Backend returns JWT token

Token is stored in localStorage

All subsequent requests include the token in the Authorization header

Protected routes check for valid token

Environment Variables
Create a .env file in the root directory with the following variables:

VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=Billing System

# Add other environment-specific variables here

Styling Approach
Tailwind CSS: Utility-first CSS framework

CSS Variables: For theming support

Tailwind Merge: For conditional class merging

Tailwind Animate: For animations

Component Architecture
The UI is built using:

Radix Primitives: Unstyled, accessible components

ShadCN Components: Styled components built on Radix

Custom Components: Application-specific components

Best Practices
JWT Security:

Tokens are stored in localStorage (consider adding refresh token flow)

Implemented token expiration checks

Protected routes validate token presence

Data Fetching:

TanStack Query for server state management

Optimistic updates for better UX

Error handling with toast notifications

Form Handling:

React Hook Form for performant forms

Zod for schema validation

Custom form components with proper accessibility

Known Limitations
LocalStorage is vulnerable to XSS attacks (consider adding HttpOnly cookies for production)

No refresh token implementation (sessions expire when JWT expires)

Basic error handling (could be enhanced with more user-friendly messages)

Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

License

MIT

This README provides:

1. Clear overview of the application
2. Detailed tech stack information
3. Project structure explanation
4. Setup instructions
5. Authentication details
6. Best practices
7. Contribution guidelines

You may want to customize:

- The feature list to match your exact implementation
- Add screenshots or gifs of the UI
- Include specific deployment instructions if needed
- Add API documentation links if publicly available
