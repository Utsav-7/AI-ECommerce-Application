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
};

