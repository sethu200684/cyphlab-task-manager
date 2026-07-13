"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import ProtectedRoute from "../../components/ProtectedRoute";

function DashboardContent() {
  const { user, token, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    apiFetch("/projects", { token })
      .then(setProjects)
      .catch((e) => setError(e.message));
  }, [token]);

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
          <p className="text-sm text-gray-500">Role: {user?.role}</p>
        </div>
        <button onClick={logout} className="text-sm underline">
          Log out
        </button>
      </div>

      <section>
        <h2 className="font-medium mb-3">
          {user?.role === "TEAM_MEMBER" ? "Your projects" : "All projects"}
        </h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid gap-3">
          {projects.map((p) => (
            <div key={p.id} className="p-4 bg-white rounded-lg shadow-sm border">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">{p.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {p._count?.tasks ?? 0} tasks &middot; {p.members?.length ?? 0} members
              </p>
            </div>
          ))}
          {projects.length === 0 && !error && (
            <p className="text-sm text-gray-500">No projects yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}