import { Routes, Route, Navigate } from "react-router-dom";
import RequireAdmin from "../auth/RequireAdmin";
import AdminLayout from "../layout/AdminLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

import Users from "../pages/Users";
import UserDetail from "../pages/Users/Detail";

import Observability from "../pages/Observability";

import Conversations from "../pages/Conversations";
import ConversationThread from "../pages/Conversations/Thread";

import Bugs from "../pages/Bugs";
import BugDetail from "../pages/Bugs/Detail";

import FinanceOverview from "../pages/Finance/Overview";
import FinanceUsers from "../pages/Finance/Users";
import FinanceTransactions from "../pages/Finance/Transactions";
import FinanceReconciliation from "../pages/Finance/Reconciliation";

import Audit from "../pages/Audit";

import Orders from "../pages/Orders";
import OrderDetail from "../pages/Orders/Detail";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= ROTAS PÚBLICAS ================= */}
      <Route path="/login" element={<Login />} />

      {/* ================= ROTAS PROTEGIDAS ================= */}
      <Route
        path="/"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />

        <Route path="observability" element={<Observability />} />

        <Route path="conversations" element={<Conversations />} />
        <Route path="conversations/:id" element={<ConversationThread />} />

        <Route path="bugs" element={<Bugs />} />
        <Route path="bugs/:id" element={<BugDetail />} />

        <Route path="finance" element={<FinanceOverview />} />
        <Route path="finance/users" element={<FinanceUsers />} />
        <Route path="finance/transactions" element={<FinanceTransactions />} />
        <Route
          path="finance/reconciliation"
          element={<FinanceReconciliation />}
        />

        <Route path="audit" element={<Audit />} />

        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
