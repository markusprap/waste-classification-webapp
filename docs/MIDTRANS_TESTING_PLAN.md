# Midtrans Payment Integration Testing Plan

## Overview
This document outlines a comprehensive testing plan for the Midtrans payment integration in the WasteWise AI application.

## Prerequisites
- Backend server is running
- Frontend server is running
- User account for testing is created
- Midtrans sandbox credentials are correctly configured

## Testing Scenarios

### 1. Configuration Verification
- [ ] Visit `/payment/test` page
- [ ] Verify client key is loaded
- [ ] Verify server key status is "Configured correctly"
- [ ] Verify environment mode is "Sandbox"

### 2. Basic Transaction Creation
- [ ] Click "Test Payment" on the test page
- [ ] Verify transaction is created successfully
- [ ] Verify a token and redirect URL are returned
- [ ] Check the browser console for any errors

### 3. User Upgrade Flow
- [ ] Visit user dashboard
- [ ] Verify subscription card shows "Free" plan
- [ ] Click "Upgrade to Premium" button
- [ ] Verify redirection to payment process page
- [ ] Click "Pay Now"
- [ ] Verify Midtrans payment popup appears

### 4. Payment Success Path
- [ ] Complete payment using test credit card (4811 1111 1111 1114)
- [ ] Enter CVV (123) and future expiry date
- [ ] Enter 3D Secure OTP (112233)
- [ ] Verify redirection to success page
- [ ] Verify countdown and automatic redirection to dashboard
- [ ] Verify user plan is updated to "Premium"
- [ ] Verify subscription card now shows "Premium" badge

### 5. Payment Pending Path
- [ ] Start new payment process
- [ ] Choose Virtual Account payment method
- [ ] Complete the virtual account information
- [ ] Verify redirection to pending page
- [ ] Check database for pending transaction record

### 6. Payment Failure Path
- [ ] Start new payment process
- [ ] Cancel the payment before completion
- [ ] Verify redirection to error page
- [ ] Verify user plan remains "Free"

### 7. Notification Handling (Simulated)
- [ ] Create a payment with pending status (e.g., Virtual Account)
- [ ] Use Midtrans dashboard to simulate payment notification
- [ ] Verify the backend correctly processes the notification
- [ ] Verify user plan is updated to "Premium" for successful payment
- [ ] Verify subscription record is created in the database

### 8. Edge Cases
- [ ] Test with non-authenticated user (should redirect to login)
- [ ] Test with user who already has premium plan
- [ ] Test with network interruption during payment
- [ ] Test with browser refresh during payment flow

### 9. Receipt Generation and Viewing
- [ ] Complete a successful payment
- [ ] Visit dashboard page to see transaction history
- [ ] Click "View Receipt" for a completed transaction
- [ ] Verify receipt page shows correct payment details
- [ ] Test the print functionality
- [ ] Verify non-authenticated users cannot access receipts

## Verification Methods
- Check browser console for client-side errors
- Examine backend logs for server-side issues
- Verify database records for subscription updates
- Inspect Midtrans dashboard for transaction status

## Expected Results
- Successful payments should upgrade the user to Premium plan
- Failed payments should keep the user on Free plan
- Pending payments should show appropriate status until resolved
- Error handling should provide meaningful feedback to users

## Reporting
Document any issues found during testing, including:
- Steps to reproduce
- Expected vs actual behavior
- Error messages
- Screenshots or logs
