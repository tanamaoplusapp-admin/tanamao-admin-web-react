import { Navigate } from "react-router-dom";
import { isAdminUser } from "../auth/adminGuard";

export default function RequireAdmin({ children }) {
  const token = localStorage.getItem("admin_token");
  const user = JSON.parse(localStorage.getItem("admin_user") || "null");

  if (!token || !user || !isAdminUser(user)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}