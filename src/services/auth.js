import api from "./api";

export async function adminLogin(email, password) {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });

  const { token, user } = response.data;

  if (token) {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(user));
  }

  return response.data;
}
