import API from "./api";

export async function getBugs() {
  const res = await API.get("/admin/bugs");
  return res.data?.items || [];
}

export async function getBugById(id) {
  const res = await API.get(`/admin/bugs/${id}`);
  return res.data;
}

export async function getBugLogs(id) {
  const res = await API.get(`/admin/bugs/${id}/logs`);
  return res.data;
}

export async function resolveBug(id) {
  const res = await API.post(`/admin/bugs/${id}/resolve`);
  return res.data;
}

export async function startBug(id) {
  const res = await API.post(`/admin/bugs/${id}/start`);
  return res.data;
}

export async function reopenBug(id) {
  const res = await API.post(`/admin/bugs/${id}/reopen`);
  return res.data;
}