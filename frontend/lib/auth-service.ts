// This file is a placeholder for the actual authentication service
// that would interact with your backend API

import {
  SignInFormValues,
  SignUpFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
  ProfileFormValues,
  ChangePasswordFormValues
} from './auth-validation';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  company?: string;
  bio?: string;
  phoneNumber?: string;
  avatar?: string;
  // Additional fields from backend model
  role?: string;
  isVerified?: boolean;
  profileImage?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function signIn(values: SignInFormValues): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      credentials: 'include', // Important: This allows the browser to store the session cookie
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Invalid email or password',
      };
    }

    // Store the access token in localStorage
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred while connecting to the server.',
    };
  }
}

export async function signUp(values: SignUpFormValues): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: values.firstname,
        lastName: values.lastname,
        email: values.email,
        password: values.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.errors ? data.errors[ 0 ].msg : (data.message || 'Registration failed. Please try again.')
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred while connecting to the server.'
    };
  }
}

export async function forgotPassword(values: ForgotPasswordFormValues): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: values.email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to process your request.',
      };
    }

    return {
      success: true,
      message: data.message || 'If your email is registered with us, you will receive a password reset link shortly.'
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred while connecting to the server.'
    };
  }
}

export async function resendVerification(email: string): Promise<{ success: boolean; message?: string; isVerified?: boolean }> {
  try {
    const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check specifically for the 'already verified' message
      if (response.status === 400 && data.message?.includes('already verified')) {
        return {
          success: true,
          isVerified: true,
          message: data.message || 'This email is already verified. Please sign in.'
        };
      }

      return {
        success: false,
        message: data.message || 'Failed to resend verification email.'
      };
    }

    return {
      success: true,
      message: data.message || 'Verification email sent. Please check your inbox.'
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred while connecting to the server.'
    };
  }
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`http://localhost:5000/api/auth/verify-email/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to verify email.',
      };
    }

    return {
      success: true,
      message: data.message || 'Your email has been verified successfully. You can now sign in.'
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred while connecting to the server.'
    };
  }
}

export async function resetPassword(token: string, values: ResetPasswordFormValues): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: values.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to reset password.',
      };
    }

    return {
      success: true,
      message: data.message || 'Your password has been reset successfully. You can now sign in with your new password.'
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred while connecting to the server.'
    };
  }
}

export async function updateProfile(values: ProfileFormValues): Promise<{ success: boolean; message?: string }> {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetch('http://localhost:5000/api/users/update-profile', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
      body: JSON.stringify({
        firstName: values.firstName,
        lastName: values.lastName,
        // Add other profile fields as needed
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update profile.',
      };
    }

    return {
      success: true,
      message: data.message || 'Your profile has been updated successfully.'
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred while connecting to the server.'
    };
  }
}

export async function changePassword(values: ChangePasswordFormValues): Promise<{ success: boolean; message?: string }> {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetch('http://localhost:5000/api/users/change-password', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to change password.',
      };
    }

    return {
      success: true,
      message: data.message || 'Your password has been changed successfully.'
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred while connecting to the server.'
    };
  }
}

export async function getCurrentUser() {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetch('http://localhost:5000/api/users/me', {
      credentials: 'include', // Important: This sends cookies with the request
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - user is not logged in
        return null;
      }
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function signOut(): Promise<{ success: boolean }> {
  try {
    const response = await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Clear the access token from local storage
    localStorage.removeItem('accessToken');

    if (!response.ok) {
      throw new Error('Failed to sign out');
    }

    return { success: true };
  } catch (error) {
    // Clear token even if the API call fails
    localStorage.removeItem('accessToken');
    console.error('Error signing out:', error);
    return { success: false };
  }
}