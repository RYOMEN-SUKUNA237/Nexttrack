const BASE = '/api';

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('pt_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> || {}) } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export const login = (username: string, password: string) =>
  req<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
export const getMe = () => req<{ user: any }>('/auth/me');

// Namespaced auth (legacy compat)
export const auth = {
  login: (username: string, password: string) => login(username, password),
  me: () => getMe(),
};

export const getToken = () => localStorage.getItem('pt_token');
export const setToken = (t: string) => localStorage.setItem('pt_token', t);
export const removeToken = () => localStorage.removeItem('pt_token');

const buildQuery = (params?: Record<string, any>) => {
  if (!params) return '';
  const clean = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined));
  return Object.keys(clean).length > 0 ? '?' + new URLSearchParams(clean).toString() : '';
};

// ─── Pets ──────────────────────────────────────────────────────────────────
export const listPets = (params?: Record<string, string>) => {
  return req<{ pets: any[]; pagination: any }>(`/pets${buildQuery(params)}`);
};
export const getPet = (id: string) => req<{ pet: any; transports: any[] }>(`/pets/${id}`);
export const createPet = (data: any) => req<{ pet: any }>('/pets', { method: 'POST', body: JSON.stringify(data) });
export const updatePet = (id: string, data: any) => req<{ pet: any }>(`/pets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePet = (id: string) => req<{ message: string }>(`/pets/${id}`, { method: 'DELETE' });

// ─── Transports (Shipments) ────────────────────────────────────────────────
export const listTransports = (params?: Record<string, string>) => {
  return req<{ shipments: any[]; pagination: any }>(`/shipments${buildQuery(params)}`);
};
export const getTransport = (id: string) => req<{ shipment: any; history: any[]; courier: any }>(`/shipments/${id}`);
export const createTransport = (data: any) => req<{ shipment: any }>('/shipments', { method: 'POST', body: JSON.stringify(data) });
export const updateTransportStatus = (id: string, data: any) => req<{ shipment: any }>(`/shipments/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) });
export const pauseTransport = (id: string, data?: any) => req<{ shipment: any }>(`/shipments/${id}/pause`, { method: 'PATCH', body: JSON.stringify(data || {}) });
export const assignHandler = (id: string, courier_id: string) => req<{ shipment: any }>(`/shipments/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ courier_id }) });
export const updateTransport = (id: string, data: any) => req<{ shipment: any }>(`/shipments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTransport = (id: string) => req<{ message: string }>(`/shipments/${id}`, { method: 'DELETE' });

// Namespaced shipments (TrackMap compat)
export const shipments = {
  list: (params?: Record<string, string>) => listTransports(params),
  get: (id: string) => getTransport(id),
  togglePause: (trackingIdOrId: string, data?: any) =>
    req<any>(`/shipments/${trackingIdOrId}/pause`, { method: 'PATCH', body: JSON.stringify(data || {}) }),
};

// Namespaced couriers (legacy compat)
export const couriers = {
  list: (params?: Record<string, string>) => listHandlers(params),
};

// ─── Public Tracking ──────────────────────────────────────────────────────
export const trackPet = (trackingId: string) =>
  req<{ shipment: any; history: any[]; courier: any }>(`/shipments/${trackingId}/track`);

// ─── Handlers (Couriers) ──────────────────────────────────────────────────
export const listHandlers = (params?: Record<string, string>) => {
  return req<{ couriers: any[]; pagination: any }>(`/couriers${buildQuery(params)}`);
};
export const createHandler = (data: any) => req<{ courier: any }>('/couriers', { method: 'POST', body: JSON.stringify(data) });
export const updateHandler = (id: string, data: any) => req<{ courier: any }>(`/couriers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteHandler = (id: string) => req<{ message: string }>(`/couriers/${id}`, { method: 'DELETE' });

// ─── Customers / Owners ───────────────────────────────────────────────────
export const listOwners = (params?: Record<string, string>) => {
  return req<{ customers: any[]; pagination: any }>(`/customers${buildQuery(params)}`);
};
export const createOwner = (data: any) => req<{ customer: any }>('/customers', { method: 'POST', body: JSON.stringify(data) });
export const deleteOwner = (id: string) => req<{ message: string }>(`/customers/${id}`, { method: 'DELETE' });

// ─── Dashboard ────────────────────────────────────────────────────────────
export const getDashboardStats = () => req<any>('/dashboard/stats');
export const getActiveMap = () => req<{ transports: any[] }>('/dashboard/active-map');
export const markNotificationRead = (id: string) => req<any>(`/dashboard/notifications/${id}/read`, { method: 'PATCH' });

// ─── Messages ────────────────────────────────────────────────────────────
export const startConversation = (data: any) => req<any>('/messages/conversations', { method: 'POST', body: JSON.stringify(data) });
export const sendMessage = (conversationId: number, content: string, sender_name?: string, sender_type?: string) => req<any>('/messages/send', { method: 'POST', body: JSON.stringify({ conversation_id: conversationId, content, sender_name, sender_type }) });
export const getAdminConversations = () => req<any>('/messages/admin/conversations');
export const getConversationMessages = (id: number) => req<any>(`/messages/admin/conversations/${id}`);
export const replyToConversation = (id: number, body: string) => req<any>(`/messages/admin/conversations/${id}/reply`, { method: 'POST', body: JSON.stringify({ body }) });

// ─── Quotes ───────────────────────────────────────────────────────────────
export const submitQuote = (data: any) => req<any>('/quotes', { method: 'POST', body: JSON.stringify(data) });
export const getAdminQuotes = () => req<any>('/quotes/admin');
export const updateQuoteStatus = (id: string, status: string, notes?: string) => req<any>(`/quotes/admin/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, admin_notes: notes }) });

// ─── Reviews ─────────────────────────────────────────────────────────────
export const submitReview = (data: any) => req<any>('/reviews', { method: 'POST', body: JSON.stringify(data) });
export const getApprovedReviews = () => req<any>('/reviews/approved');
export const getAdminReviews = () => req<any>('/reviews/admin');
export const approveReview = (id: string) => req<any>(`/reviews/admin/${id}/approve`, { method: 'PATCH' });
export const deleteReview = (id: string) => req<any>(`/reviews/admin/${id}`, { method: 'DELETE' });

// ─── Emails ───────────────────────────────────────────────────────────────
export const getEmailDrafts = () => req<any>('/emails/drafts');
export const sendEmailDraft = (id: string) => req<any>(`/emails/drafts/${id}/send`, { method: 'POST' });
export const deleteEmailDraft = (id: string) => req<any>(`/emails/drafts/${id}`, { method: 'DELETE' });
export const subscribeToTracking = (trackingId: string, email: string, name?: string) =>
  req<any>('/emails/subscribe', { method: 'POST', body: JSON.stringify({ trackingId, email, name }) });

// ─── Legacy Namespaces for Admin Pages ─────────────────────────────────────
export const customers = {
  list: listOwners,
  create: createOwner,
  delete: deleteOwner,
};

export const messages = {
  startConversation: startConversation,
  send: (data: any) => sendMessage(data.conversation_id, data.content, data.sender_name, data.sender_type),
  getMessages: (id: number | string) => req<any>(`/messages/conversations/${id}/messages`),
  adminListConversations: (params?: any) => {
    return req<any>(`/messages/admin/conversations${buildQuery(params)}`);
  },
  adminGetConversation: (id: number | string) => req<any>(`/messages/admin/conversations/${id}`),
  adminReply: (data: { conversation_id: number | string; content: string }) => req<any>(`/messages/admin/conversations/${data.conversation_id}/reply`, { method: 'POST', body: JSON.stringify({ body: data.content }) }),
  adminCloseConversation: (id: number | string) => req<any>(`/messages/admin/conversations/${id}/close`, { method: 'PATCH' }),
  adminReopenConversation: (id: number | string) => req<any>(`/messages/admin/conversations/${id}/reopen`, { method: 'PATCH' }),
};

export const quotes = {
  adminList: (params?: any) => {
    return req<any>(`/quotes/admin${buildQuery(params)}`);
  },
  adminStats: () => req<any>('/quotes/admin/stats'),
  adminGet: (id: string) => req<any>(`/quotes/admin/${id}`),
  adminUpdateStatus: (id: string, data: { status: string }) => req<any>(`/quotes/admin/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminUpdateNotes: (id: string, notes: string) => req<any>(`/quotes/admin/${id}/notes`, { method: 'PATCH', body: JSON.stringify({ admin_notes: notes }) }),
  adminDelete: (id: string) => req<any>(`/quotes/admin/${id}`, { method: 'DELETE' }),
};

export const reviews = {
  adminList: (params?: any) => {
    return req<any>(`/reviews/admin${buildQuery(params)}`);
  },
  adminApprove: (id: string) => req<any>(`/reviews/admin/${id}/approve`, { method: 'PATCH' }),
  adminReject: (id: string) => req<any>(`/reviews/admin/${id}/reject`, { method: 'PATCH' }),
  adminDelete: (id: string) => req<any>(`/reviews/admin/${id}`, { method: 'DELETE' }),
};

export const emails = {
  adminListDrafts: (params?: any) => {
    return req<any>(`/emails/drafts${buildQuery(params)}`);
  },
  adminSendDraft: (id: string) => req<any>(`/emails/drafts/${id}/send`, { method: 'POST' }),
  adminCancelDraft: (id: string) => req<any>(`/emails/drafts/${id}/cancel`, { method: 'PATCH' }),
  adminDeleteDraft: (id: string) => req<any>(`/emails/drafts/${id}`, { method: 'DELETE' }),
  adminUpdateDraft: (id: string, data: any) => req<any>(`/emails/drafts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
