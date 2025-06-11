/**
 * API error handling utilities
 */

/**
 * Handle API errors with proper error messages
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if error doesn't provide one
 * @returns {Object} Standardized error response
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  // Check if it's a known error format
  if (error.response?.data?.message) {
    return {
      status: 'error',
      message: error.response.data.message
    };
  }
  
  // For fetch errors
  if (error.message) {
    return {
      status: 'error',
      message: error.message
    };
  }
  
  // Default error response
  return {
    status: 'error',
    message: defaultMessage
  };
};

/**
 * Format payment error for user display
 * @param {string} errorCode - Midtrans error code
 * @param {string} errorMessage - Original error message
 * @returns {string} User-friendly error message
 */
export const formatPaymentError = (errorCode, errorMessage) => {
  // Map common Midtrans error codes to user-friendly messages
  const errorMap = {
    'DUPLICATE_ORDER_ID': 'This transaction was already processed. Please try again with a new request.',
    'INVALID_PARAMETER': 'There was an issue with your payment information. Please try again.',
    'TRANSACTION_NOT_FOUND': 'The transaction could not be found. Please try again.',
    'SERVER_ERROR': 'The payment server is currently unavailable. Please try again later.',
    'CARD_DECLINED': 'Your card was declined. Please try another payment method.',
    '3D_SECURE_FAILED': 'The 3D Secure authentication failed. Please try again or use another card.',
    'EXPIRED': 'The payment session has expired. Please try again.'
  };
  
  // Return mapped error message or original if not found
  return errorMap[errorCode] || errorMessage || 'An error occurred during payment processing.';
};
