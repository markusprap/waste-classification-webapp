# Testing the Midtrans Payment Integration

This guide provides instructions for testing the Midtrans payment gateway integration for the WasteWise AI application.

## Prerequisites

- A Midtrans Sandbox account
- Access to Midtrans dashboard
- Proper configuration of environment variables:
  - `MIDTRANS_SERVER_KEY` (backend)
  - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` (frontend)

## Environment Setup

1. Make sure you're using the Midtrans Sandbox environment for testing.
2. Ensure the following environment variables are set in your `.env` files:

For the frontend:
```
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-client-key-here
```

For the backend:
```
MIDTRANS_SERVER_KEY=your-server-key-here
```

## Testing Process

### 1. Basic Integration Testing

Visit the test page at `/payment/test` to verify that Midtrans is properly integrated:

- Check if environment variables are set
- Verify Midtrans script is loaded
- Run a diagnostic test to check all components

### 2. Sandbox Testing

1. Log in to the application
2. Open the user dashboard
3. Click the "Upgrade" button on a Free plan
4. You should see the Midtrans payment popup
5. Complete the payment with one of the test payment methods:
   - Credit Card (Test Card Number: `4811 1111 1111 1114`, CVV: `123`, Expiry: any future date)
   - Virtual Account
   - E-Wallet
   - Other available methods

### 3. Testing Different Payment Scenarios

#### Successful Payment
- Complete the payment process
- You should be redirected to `/payment/success`
- Your account should be upgraded to Premium
- Check the dashboard to verify your plan has changed

#### Pending Payment
- Choose a payment method that results in pending status (like Virtual Account)
- Don't complete the payment yet
- You should be redirected to `/payment/pending`
- Check the Payment Dashboard to see the pending transaction

#### Failed Payment
- Cancel the payment or use an invalid payment method
- You should be redirected to `/payment/error`
- Your account should remain on the Free plan

### 4. Testing Notifications

Midtrans sends notifications to update the payment status. To test this:

1. Make a payment that results in a pending status (e.g., Virtual Account)
2. Go to the Midtrans Dashboard
3. Find your transaction
4. Manually change the status to "Settlement"
5. Midtrans will send a notification to your webhook URL
6. Verify that your account is upgraded to Premium

## Debugging

### Common Issues

1. **Popup Not Showing**
   - Check browser console for errors
   - Verify that the Midtrans script is loaded
   - Ensure client key is correct

2. **Payment Not Processing**
   - Check server logs for errors
   - Verify server key is correct
   - Ensure notification URL is accessible

3. **Account Not Upgrading**
   - Check if notifications are being received
   - Verify that the payment ID format is correct
   - Check database for subscription records

### Monitoring Transactions

Visit the Payment Dashboard at `/payment/dashboard` to monitor all transactions:

- View transaction status
- Check payment details
- Access payment receipts

## Test Card Information

For credit card testing in the sandbox environment:

- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Expiry Date: Any future date
- 3D Secure OTP: `112233`

## Production Migration

When moving to production:

1. Replace sandbox keys with production keys
2. Update the environment variable `NODE_ENV` to "production"
3. Enable strict signature verification
4. Test with a real payment (small amount)
5. Monitor the first few transactions closely

## References

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Midtrans Sandbox Dashboard](https://dashboard.sandbox.midtrans.com/)
- [Test Cards for Sandbox](https://docs.midtrans.com/en/technical-reference/sandbox-test)
