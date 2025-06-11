# Midtrans Payment Integration

This guide provides instructions on testing the Midtrans payment integration for upgrading user accounts from Free to Premium.

## Prerequisites

- Make sure the backend server is running
- Make sure the frontend server is running
- Have an active user account to test with

## Setup

1. The Midtrans integration is already configured with sandbox credentials:
   - Merchant ID: G932456516
   - Client Key: SB-Mid-client-1AwEzlr8EfunHLj3
   - Server Key: SB-Mid-server-la0w2G9_au79UZl0mSqnhZvO

2. These credentials are already set in the respective `.env` files:
   - `backend/.env` for server-side operations
   - `frontend/.env` for client-side operations

## Testing the Integration

1. Start both backend and frontend servers
2. Log in to the application with a valid user account
3. Navigate to the Dashboard or Profile page
4. Click the "Upgrade to Premium" button
5. You will be redirected to the payment process page
6. Click "Pay Now" to initialize the Midtrans payment popup
7. Use the Midtrans sandbox payment methods to test:
   - Credit Card: Card Number `4811 1111 1111 1114`, CVV `123`, Expiry Date: any future date
   - For 3D Secure authentication, use password `112233`
   - Other payment methods like virtual accounts and e-wallets are also available for testing

## Test Page

A dedicated test page is available at `/payment/test` that allows you to:
- Verify the Midtrans configuration
- Test the payment flow
- See detailed responses from the Midtrans API

## Payment Flow

1. User clicks "Upgrade to Premium"
2. Frontend sends a request to create a transaction
3. Backend generates a unique order ID and transaction details
4. Midtrans returns a transaction token
5. Frontend displays the Midtrans payment popup
6. User completes payment in the popup
7. User is redirected to success/pending/error page based on payment status
8. Midtrans sends a notification to the backend webhook
9. Backend verifies the notification and updates the user's subscription

## Debugging

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the backend logs for server-side errors
3. Verify the environment variables are set correctly
4. Use the `/payment/test` page to diagnose configuration issues

## Production Deployment

When moving to production:
1. Update the Midtrans credentials to production credentials
2. Update the `MIDTRANS_ENV` variable to `production`
3. Test the entire flow again in production mode

## References

- [Midtrans API Documentation](https://docs.midtrans.com/)
- [Midtrans-Client Library Documentation](https://github.com/Midtrans/midtrans-nodejs-client)
