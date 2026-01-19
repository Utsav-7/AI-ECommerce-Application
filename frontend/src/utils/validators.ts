export const validators = {
  email: (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return null;
  },

  password: (password: string): string | null => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  },

  confirmPassword: (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) {
      return 'Confirm password is required';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  required: (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  phoneNumber: (phoneNumber: string): string | null => {
    if (!phoneNumber) {
      return null; // Phone number is optional
    }
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      return 'Invalid phone number format';
    }
    return null;
  },

  gstNumber: (gstNumber: string, isRequired: boolean = false): string | null => {
    if (!gstNumber || gstNumber.trim() === '') {
      if (isRequired) {
        return 'GST number is required for seller registration';
      }
      return null;
    }
    
    // GST number format: 2 digits (state code) + 5 letters (PAN) + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
    // Example: 22AAAAA0000A1Z5
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    const upperGst = gstNumber.trim().toUpperCase();
    
    if (upperGst.length !== 15) {
      return 'GST number must be exactly 15 characters';
    }
    
    if (!gstRegex.test(upperGst)) {
      return 'Invalid GST number format (e.g., 22AAAAA0000A1Z5)';
    }
    
    return null;
  },
};

