# Waste Classification Web App

A web application that can classify different types of waste using machine learning.
Built for Coding Camp 2025 Capstone Project.

## What it does
Upload a photo of waste and the AI will tell you what type it is (organic, recyclable, etc).

## Features
- Image-based waste classification
- Real-time predictions
- Educational resources on waste management
- User subscription plans (Free and Premium)
- Secure payment processing with Midtrans

## Technologies Used

- Python (Flask, TensorFlow/Keras)
- JavaScript (React.js, Next.js, Tailwind CSS)
- Node.js & Express.js
- Midtrans Payment Gateway

## Getting Started

### Frontend (Next.js)

1. Install dependencies:
    ```bash
    cd frontend
    npm install --legacy-peer-deps
    ```
2. Run the development server:
    ```bash
    npm run dev
    ```

### Backend (Node.js with Hapi)

1. Install dependencies:
    ```bash
    cd backend
    npm install
    ```
2. Run the backend server:
    ```bash
    npm run dev
    ```

### Database Setup

The project includes a pre-seeded SQLite database (`backend/database/prisma/dev.db`) with sample data for immediate testing. If you want to reset or recreate the database:

1. Generate Prisma client:
    ```bash
    cd backend
    npx prisma generate
    ```

2. Run the seeding script to populate the database with sample data:
    ```bash
    cd backend
    node scripts/run-final-seeding.js
    ```

## Subscription Plans

The application offers two subscription plans:

- **Free Plan**: Limited to 30 waste classifications per month
- **Premium Plan**: Unlimited classifications for Rp 10,000 per month

## Payment System

The payment system is implemented using Midtrans as the payment gateway:

1. Users can upgrade from Free to Premium plan in the user dashboard
2. Payment is processed securely through Midtrans
3. Users receive immediate access to Premium features upon successful payment

For detailed information about the payment implementation, see:
- [Payment System Documentation](./docs/PAYMENT_SYSTEM.md)
- [Midtrans Testing Guide](./docs/MIDTRANS_TESTING_GUIDE.md)

## Contributors

- MC009D5X0397 Dea Yuliani Sabrina
- FC013D5Y1566 Markus Prap Kurniawan
- FC375D5Y1854 Izaq Zulfikar
- MC009D5Y2213 Dwi Nurcahyo Purbonegoro
- MC009D5X2450 Clara Marsya Dekawanti

## Coding Camp 2025 powered by DBS Foundation