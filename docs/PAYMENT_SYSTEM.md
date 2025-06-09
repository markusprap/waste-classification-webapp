# Payment System Documentation

## Overview

The WasteWise AI application implements a payment system using Midtrans as the payment gateway. This system allows users to upgrade from the free plan to the premium plan.

## Features

- **Plan Upgrade**: Users can upgrade from free (30 classifications/month) to premium (unlimited classifications)
- **Payment Processing**: Secure payment processing through Midtrans
- **Payment Status Tracking**: Tracking payment status (success, pending, failed)
- **Subscription Management**: Recording and managing user subscriptions
- **Payment History**: Viewing payment transaction history

## Technology Stack

- **Payment Gateway**: Midtrans
- **Frontend**: Next.js, React
- **Backend**: Node.js with Hapi.js
- **Database**: PostgreSQL with Prisma ORM

## Implementation Details

### Frontend Components

- `MidtransProvider`: Initializes Midtrans client SDK
- `midtransService.js`: Handles payment processing logic
- Payment Status Pages: Success, Pending, Error pages
- Payment Dashboard: For viewing transaction history

### Backend Components

- Payment Controller: Handles payment webhooks and notifications
- Signature Verification: Ensures the authenticity of notifications
- Subscription Management: Updates user plans based on payment status

### Database Schema

The Subscription model includes:

```prisma
model Subscription {
  id            String    @id @default(uuid())
  userId        String
  plan          String    @default("free")
  status        String    @default("active")
  startDate     DateTime  @default(now())
  endDate       DateTime?
  paymentId     String?   // Order ID from payment gateway
  paymentStatus String?   // success, pending, failed
  currency      String    @default("IDR")
  amount        Float?    @default(10000) // Default 10000 IDR for premium
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  user          User      @relation(fields: [userId], references: [id])
}
```

## Payment Flow

1. User clicks "Upgrade" in the dashboard
2. Frontend generates a unique order ID and requests a payment token
3. Midtrans payment popup appears, showing payment options
4. User completes payment through Midtrans
5. User is redirected to success/pending/error page based on status
6. Midtrans sends notification to the backend webhook
7. Backend verifies the notification and updates user's plan

## Testing

See the [Midtrans Testing Guide](./MIDTRANS_TESTING_GUIDE.md) for detailed information on testing the payment system.

## Configuration

### Environment Variables

Frontend:
```
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
NEXT_PUBLIC_BASE_URL=your_base_url
```

Backend:
```
MIDTRANS_SERVER_KEY=your_server_key
```

## Security Considerations

- **Signature Verification**: All notifications from Midtrans are verified using signatures
- **Server-Side Validation**: Payment amounts and user data are validated on the server
- **Secure Storage**: No sensitive payment information is stored in the application
- **HTTPS**: All communication with Midtrans is done over HTTPS

## Debugging

- Check the browser console for frontend errors
- Examine server logs for backend issues
- Verify webhook notifications in Midtrans dashboard
- Use the Payment Test page at `/payment/test`

## References

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Documentation](https://www.prisma.io/docs/)
