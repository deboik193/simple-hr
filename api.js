// services/api.js
import { fetchClient } from './libs/fetchClient';

export const getManagers = async () => {
  return await fetchClient.get("/api/users");
};

export const getEmployees = async () => {
  return await fetchClient.get("/api/users/employee");
};

export const getBranch = async () => {
  return await fetchClient.get("/api/settings/branch");
};

export const updateBranch = async (data, id) => {
  return await fetchClient.patch(`/api/settings/branch/${id}`, data);
};

export const branch = async (data) => {
  return await fetchClient.post("/api/settings/branch", data);
};

export const getDepartment = async () => {
  return await fetchClient.get("/api/settings/department");
};

export const updateDepartment = async (data, id) => {
  return await fetchClient.patch(`/api/settings/department/${id}`, data);
};

export const department = async (data) => {
  return await fetchClient.post("/api/settings/department", data);
};

export const getInitialBalance = async () => {
  return await fetchClient.get("/api/settings/leave-initial-balance");
};

export const initialLeaveBalance = async (data, id) => {
  return await fetchClient.patch(`/api/settings/leave-initial-balance/${id}`, data);
};

export const leavePolicy = async (data) => {
  return await fetchClient.post("/api/settings/leave-policy", data);
};

export const updateLeavePolicy = async (data, id) => {
  return await fetchClient.patch(`/api/settings/leave-policy/${id}`, data);
};

export const getLeavePolicy = async () => {
  return await fetchClient.get("/api/settings/leave-policy");
};

export const deleteLeavePolicy = async (id) => {
  return await fetchClient.delete(`/api/settings/leave-policy/${id}`);
};

// These don't need auth tokens
export const loginUser = async (data) => {
  return await fetchClient.post("/api/users/login", data);
};

export const forgotPassword = async (data) => {
  return await fetchClient.post("/api/users/forgot-password", data);
};

export const resetPassword = async (data) => {
  return await fetchClient.post("/api/users/reset-password", data);
};

export const registerUser = async (data) => {
  return await fetchClient.post("/api/users/employee", data);
};