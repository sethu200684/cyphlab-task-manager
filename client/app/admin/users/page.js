"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";
import ProtectedRoute from "../../../components/ProtectedRoute";

const ROLES = ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"];

function AdminUsersContent() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  function loadUsers() {
    apiFetch("/users", { token })
      .then(setUsers)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (token) loadUsers();
  }, [token]);

  async function changeRole(userId, role) {
    try {
      await apiFetch(`/users/${userId}/role`, {
        method: "PATCH",
        token,
        body: { role },
      });
      loadUsers();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">User Management</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="grid gap-3">
        {users.map((u) => (
          <div key={u.id} className="p-4 bg-white border rounded-lg flex justify-between items-center">
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>
            <select
              value={u.role}
              onChange={(e) => changeRole(u.id, e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}