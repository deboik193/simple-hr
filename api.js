// services/api.js
import { fetchClient } from './libs/fetchClient';

export const getManagers = async () => {
  return await fetchClient.get("/api/users/managers");
};

export const getUserByRole = async (role) => {
  return await fetchClient.get(`/api/users/${role}`);
};

export const getAllUser = async () => {
  return await fetchClient.get(`/api/users`);
};

export const fetchMe = async () => {
  return await fetchClient.get(`/api/users/me`);
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

export const updateUser = async (data, id) => {
  return await fetchClient.patch(`/api/users/employee/${id}`, data);
};

export const deleteUser = async (id) => {
  return await fetchClient.delete(`/api/users/employee/${id}`);
}

export const requestLeave = async (data) => {
  return await fetchClient.post(`/api/leave-request`, data);
}

export const declineLeaveByReliefOfficer = async (data, id) => {
  return await fetchClient.patch(`/api/leave-request/${id}/relief-decline`, { notes: data });
}

export const approveLeaveByReliefOfficer = async (data, id) => {
  return await fetchClient.patch(`/api/leave-request/${id}/relief-approve`, { notes: data });
}

export const declineLeaveByTeamLead = async (data, id) => {
  return await fetchClient.patch(`/api/leave-request/${id}/team-lead-decline`, { notes: data });
}

export const approveLeaveByTeamLead = async (data, id) => {
  return await fetchClient.patch(`/api/leave-request/${id}/team-lead-approve`, { notes: data });
}

export const approveLeaveByManager = async (data, id) => {
  return await fetchClient.patch(`/api/leave-request/${id}/manager-approve`, { notes: data });
}

export const declineLeaveByManager = async (data, id) => {
  return await fetchClient.patch(`/api/leave-request/${id}/manager-decline`, { notes: data });
}

export const approveLeaveByHR = async (data, id) => {
  return await fetchClient.patch(`/api/leave-request/${id}/hr-approve`, { notes: data });
}

export const fetchLeave = async () => {
  return await fetchClient.get('/api/leave-request')
}

export const declineLeaveByHR = async (data, id) => {
  return await fetchClient.patch(`/api/leave-request/${id}/hr-decline`, { notes: data });
}

export const dashboardStats = async () => {
  return await fetchClient.get('/api/dashboard')
}

export const uploadCloudinary = async (data) => {
  return await fetchClient.post(`/api/upload`, data)
}