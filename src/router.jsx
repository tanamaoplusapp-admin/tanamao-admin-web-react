import { createBrowserRouter } from "react-router-dom";

import Login from "./pages/Login";
import RequireAdmin from "./auth/RequireAdmin";
import AdminLayout from "./layout/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Users from "./pages/Users";

import Conversations from "./pages/Conversations";
import Thread from "./pages/Conversations/Thread"; // ← FALTAVA

import Finance from "./pages/Finance";

import Bugs from "./pages/Bugs";
import BugDetail from "./pages/Bugs/Detail";

import Audit from "./pages/Audit";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <Dashboard /> },

      { path: "orders", element: <Orders /> },

      { path: "users", element: <Users /> },
      { path: "finance/users", element: <Users /> },

      // CONVERSAS
      { path: "conversations", element: <Conversations /> },
      { path: "conversations/:id", element: <Thread /> }, // ← ESSA ERA A QUE FALTAVA

      { path: "finance", element: <Finance /> },

      // BUGS
      { path: "bugs", element: <Bugs /> },
      { path: "bugs/:id", element: <BugDetail /> },

      { path: "audit", element: <Audit /> },
    ],
  },
]);