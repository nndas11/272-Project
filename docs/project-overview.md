# Project Overview

## 272-Project

The 272-Project is a stock trading platform that provides users with a comprehensive interface to manage their account information, balances, and trade history.

### Key Features

- **User Profile Management**: View and edit user information (name, email).
- **Account Balances Management**: View, add, and delete multi-currency account balances.
- **Trade History**: View and delete trade history.
- **Real-time Price Updates**: Real-time stock price updates using WebSockets.
- **Theming**: Light and dark mode support with persistence.
- **Dockerized Environment**: Easy setup with Docker and Docker Compose.

### Architecture

The project is divided into a frontend and a backend:

- **Frontend**: A Next.js application with React and TypeScript.
- **Backend**: A Flask (Python) application providing a RESTful API.
- **Database**: PostgreSQL for data storage.
- **Real-time**: WebSocket for live price data.

### User Dashboard

A complete user profile and dashboard management system has been implemented with full CRUD operations, professional UI/UX, and complete documentation.

- **Profile Icon Navigation**: Visible in the top-right corner when logged in, providing quick access to the user's profile, dashboard, and logout functionality.
- **User Profile Page (`/profile`)**: A dedicated page for managing account information, balances, and trade history.
- **Backend API**: 6 new endpoints to support CRUD operations for the user dashboard.
- **Security**: JWT authentication, user data isolation, email uniqueness validation, password hashing, and SQL injection prevention.
- **UI/UX**: Responsive design, success/error messages, confirmation dialogs, loading states, and intuitive navigation.
