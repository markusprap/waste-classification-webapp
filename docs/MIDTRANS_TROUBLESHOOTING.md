# Midtrans Payment Integration Troubleshooting Guide

This guide provides solutions for common issues that may occur with the Midtrans payment integration in the WasteWise AI application.

## Common Issues and Solutions

### 1. Payment Popup Not Appearing

**Symptoms:**
- Clicking "Pay Now" button doesn't show the Midtrans payment popup
- Console shows errors related to Snap.js

**Possible Causes:**
- Midtrans script not loaded properly
- Client key misconfiguration
- Network issues preventing script loading

**Solutions:**
1. Check browser console for specific error messages
2. Verify that `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` is set correctly in the frontend environment
3. Try refreshing the page to reload the Midtrans script
4. Test on the `/payment/test` page to verify configuration

### 2. Transaction Creation Failing

**Symptoms:**
- Error message when trying to create a transaction
- "Failed to create payment transaction" error

**Possible Causes:**
- Backend server not running
- Server key misconfiguration
- Network connectivity issues
- Authentication problems

**Solutions:**
1. Ensure the backend server is running on the expected port
2. Check server logs for specific error messages
3. Verify that `MIDTRANS_SERVER_KEY` is set correctly in the backend environment
4. Check that you are properly authenticated (signed in)
5. Try signing out and back in to refresh authentication tokens

### 3. Payments Always Failing

**Symptoms:**
- Payments never complete successfully even with valid test cards
- Always redirected to error page

**Possible Causes:**
- Using invalid test card information
- Incorrect configuration of Midtrans account
- Webhook URL not properly configured

**Solutions:**
1. Use the exact test card numbers specified in the documentation
2. For credit card tests, use: `4811 1111 1111 1114`, CVV `123`, and any future expiry date
3. For 3D Secure OTP, use `112233`
4. Verify the Midtrans account is properly set up for testing
5. Check backend logs for error details

### 4. Account Not Upgrading After Payment

**Symptoms:**
- Payment is successful and shows "success" status
- Account still shows "Free" plan instead of "Premium"

**Possible Causes:**
- Webhook notifications not received by backend
- Error in processing the notification
- Database update failing

**Solutions:**
1. Check backend logs for notification processing errors
2. Verify the notification URL is accessible from the internet (for production)
3. Check database for subscription records
4. Try refreshing the user session or signing out and back in
5. Check the transaction status in the Midtrans dashboard

### 5. Network-Related Issues

**Symptoms:**
- Intermittent failures
- Timeout errors
- Connection refused errors

**Solutions:**
1. Check your internet connection
2. Verify firewall settings aren't blocking the required connections
3. Try using a different network
4. Check if Midtrans services are operational (status page)

## Testing Environment

Remember that the integration is configured to use Midtrans Sandbox environment for testing. All transactions are simulated and no real money is charged.

### Testing Cards for Sandbox:

| Card Type | Card Number | CVV | Expiry | 3DS Password |
|-----------|-------------|-----|--------|--------------|
| Credit Card | 4811 1111 1111 1114 | 123 | Any future date | 112233 |
| Credit Card (fail) | 4911 1111 1111 1113 | 123 | Any future date | 112233 |

## Logs and Diagnostics

When reporting issues, please include:

1. Browser console logs
2. Backend server logs
3. Specific error messages
4. Steps to reproduce the issue
5. Transaction ID if available

## Contact Support

If you continue to experience issues after trying the solutions above, please contact:

- Technical Support: support@wastewise.ai
- Midtrans Developer Documentation: https://docs.midtrans.com/
