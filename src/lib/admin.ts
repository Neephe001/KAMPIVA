import api from './axios';

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  totalAdmins: number;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get('/admin/users');
  return res.data.users;
};

export const updateUserRole = async (id: string, role: string) => {
  const res = await api.patch(`/admin/users/${id}/role`, { role });
  return res.data.user;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const getAllListings = async () => {
  const res = await api.get('/admin/listings');
  // API returns array directly
  return Array.isArray(res.data) ? res.data : (res.data.listings ?? []);
};

export const updateListingStatus = async (id: string, status: string) => {
  const res = await api.patch(`/admin/listings/${id}/status`, { status });
  return res.data.listing;
};

export const deleteListing = async (id: string) => {
  const res = await api.delete(`/admin/listings/${id}`);
  return res.data;
};

export const adminUpdateListing = async (id: string, data: any) => {
  const res = await api.put(`/admin/listings/${id}`, data);
  return res.data.listing;
};
