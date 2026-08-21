/**
 * REST API client helper for Munajat Drinks
 */

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// 1. Users API
export const usersApi = {
  getAll: (params?: { search?: string; role?: string; branch?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role && params.role !== 'All') query.append('role', params.role);
    if (params?.branch && params.branch !== 'All') query.append('branch', params.branch);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; data: any[] }>(`/users${queryString}`);
  },
  create: (data: any) =>
    request<{ success: boolean; message: string; data: any }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request<{ success: boolean; message: string; data: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean; message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// 2. Toppings API
export const toppingsApi = {
  getAll: (params?: { search?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; data: any[] }>(`/toppings${queryString}`);
  },
  create: (data: any) =>
    request<{ success: boolean; message: string; data: any }>('/toppings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request<{ success: boolean; message: string; data: any }>(`/toppings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean; message: string }>(`/toppings/${id}`, {
      method: 'DELETE',
    }),
};

// 3. Ice Levels API
export const iceLevelsApi = {
  getAll: () =>
    request<{ success: boolean; data: any[] }>('/ice-levels'),
  create: (data: any) =>
    request<{ success: boolean; message: string; data: any }>('/ice-levels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request<{ success: boolean; message: string; data: any }>(`/ice-levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean; message: string }>(`/ice-levels/${id}`, {
      method: 'DELETE',
    }),
};

// 4. Cabangs API
export const cabangsApi = {
  getAll: (params?: { search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; data: any[] }>(`/cabangs${queryString}`);
  },
  create: (data: any) =>
    request<{ success: boolean; message: string; data: any }>('/cabangs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request<{ success: boolean; message: string; data: any }>(`/cabangs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean; message: string }>(`/cabangs/${id}`, {
      method: 'DELETE',
    }),
};

// 5. Products API
export const productsApi = {
  getAll: (params?: { search?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; data: any[] }>(`/products${queryString}`);
  },
  create: (data: any) =>
    request<{ success: boolean; message: string; data: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request<{ success: boolean; message: string; data: any }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// 6. Order Codes API
export const orderCodesApi = {
  getAll: (params?: { search?: string; cabang_id?: string; order_status?: string; payment_status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.cabang_id && params.cabang_id !== 'All') query.append('cabang_id', params.cabang_id);
    if (params?.order_status && params.order_status !== 'All') query.append('order_status', params.order_status);
    if (params?.payment_status && params.payment_status !== 'All') query.append('payment_status', params.payment_status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; data: any[] }>(`/order-codes${queryString}`);
  },
  create: (data: any) =>
    request<{ success: boolean; message: string; data: any }>('/order-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request<{ success: boolean; message: string; data: any }>(`/order-codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean; message: string }>(`/order-codes/${id}`, {
      method: 'DELETE',
    }),
};

// 7. AI Settings API
export const aiSettingsApi = {
  get: (provider: string = 'gemini') =>
    request<{ success: boolean; data: any }>(`/ai-settings?provider=${provider}`),
  save: (data: any) =>
    request<{ success: boolean; message: string; data: any }>('/ai-settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// 8. Stats Summary API
export interface StatsSummary {
  orders_count: number;
  total_revenue: number;
  rating: number;
  users_count: number;
  products_count: number;
  cabangs_count: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    branch: string;
    status: string;
    avatar_color?: string;
    avatar?: string;
    created_at?: string;
  } | null;
}

export const statsApi = {
  getSummary: () =>
    request<{ success: boolean; data: StatsSummary }>('/stats/summary'),
};

// 9. App & User Settings API
export interface AppSettingsData {
  id?: number;
  user_id?: number;
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_digest: boolean;
  bg_mode: 'animated' | 'static';
  transparency: boolean;
  color_mode: 'dark' | 'light';
  two_factor_enabled: boolean;
  session_timeout: number;
  auth_security_level?: string;
  plan_name: string;
  plan_billing_cycle: string;
  plan_price: number;
  plan_status: string;
  payment_gateway: string;
  merchant_id: string;
  billing_email?: string;
}

export interface UserProfileData {
  id?: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  role?: string;
  branch?: string;
  status?: string;
  avatar_color?: string;
  avatar?: string;
  created_at?: string;
}

export const settingsApi = {
  get: () =>
    request<{ success: boolean; data: { settings: AppSettingsData; profile: UserProfileData } }>('/settings'),
  update: (data: Partial<AppSettingsData>) =>
    request<{ success: boolean; message: string; data: AppSettingsData }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateProfile: (data: Partial<UserProfileData>) =>
    request<{ success: boolean; message: string; data: any }>('/settings/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  changePassword: (data: { current_password: string; new_password: string }) =>
    request<{ success: boolean; message: string }>('/settings/password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// 10. Billing Invoices API
export interface BillingInvoiceItem {
  id: number;
  invoice_number: string;
  plan_name: string;
  amount: number;
  payment_method: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  billing_date: string;
  due_date?: string;
  download_url?: string;
}

export const invoicesApi = {
  getAll: () =>
    request<{ success: boolean; data: BillingInvoiceItem[] }>('/invoices'),
  create: (data: any) =>
    request<{ success: boolean; message: string; data: BillingInvoiceItem }>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request<{ success: boolean; message: string; data: BillingInvoiceItem }>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean; message: string }>(`/invoices/${id}`, {
      method: 'DELETE',
    }),
};

// 11. Projects API
export interface ProjectItem {
  id: number;
  name: string;
  description?: string;
  progress: number;
  color: string;
  members: number;
  days_left: number;
  status: string;
}

export const projectsApi = {
  getAll: () =>
    request<{ success: boolean; data: ProjectItem[] }>('/projects'),
  create: (data: any) =>
    request<{ success: boolean; message: string; data: ProjectItem }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request<{ success: boolean; message: string; data: ProjectItem }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean; message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
};
