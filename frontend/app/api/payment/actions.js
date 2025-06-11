'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-config";
import { handleApiError } from "@/src/utils/api-utils";

/**
 * API route to create a payment transaction
 * @param {FormData} formData - Form data containing transaction details
 * @returns {Object} Payment transaction details
 */
export async function createPaymentTransaction(formData) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return {
        status: 'error',
        message: 'Authentication required'
      };
    }
    
    const userId = session.user.id;
    const email = session.user.email;
    const fullName = session.user.name || '';
    
    // Call backend API to create payment transaction
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        email,
        fullName
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: 'error',
        message: errorData.message || 'Failed to create payment transaction'
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    return handleApiError(error, 'Failed to create payment transaction');
  }
}

/**
 * API route to get payment status
 * @param {string} orderId - Payment order ID
 * @returns {Object} Payment status
 */
export async function getPaymentStatus(orderId) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return {
        status: 'error',
        message: 'Authentication required'
      };
    }
    
    // Call backend API to get payment status
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/status/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: 'error',
        message: errorData.message || 'Failed to get payment status'
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    return handleApiError(error, 'Failed to get payment status');
  }
}
