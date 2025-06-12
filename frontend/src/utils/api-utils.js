export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.response?.data?.message) {
    return {
      status: 'error',
      message: error.response.data.message
    };
  }
  
  if (error.message) {
    return {
      status: 'error',
      message: error.message
    };
  }
  
  return {
    status: 'error',
    message: defaultMessage
  };
};

export const formatPaymentError = (errorCode, errorMessage) => {
  const errorMap = {
    'DUPLICATE_ORDER_ID': 'This transaction was already processed. Please try again with a new request.',
    'INVALID_PARAMETER': 'There was an issue with your payment information. Please try again.',
    'TRANSACTION_NOT_FOUND': 'The transaction could not be found. Please try again.',
    'SERVER_ERROR': 'The payment server is currently unavailable. Please try again later.',
    'CARD_DECLINED': 'Your card was declined. Please try another payment method.',
    '3D_SECURE_FAILED': 'The 3D Secure authentication failed. Please try again or use another card.',
    'EXPIRED': 'The payment session has expired. Please try again.'
  };
  
  return errorMap[errorCode] || errorMessage || 'An error occurred during payment processing.';
};
