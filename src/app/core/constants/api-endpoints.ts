export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password'
  },
  appointments: '/appointments',
  users: '/users',
  masterData: '/master-data',
  dentists: '/dentists',
  treatmentNotes: '/treatment-notes',
  invoices: '/invoices'
} as const;
