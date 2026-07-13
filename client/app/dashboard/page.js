"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import ProtectedRoute from "../../components/ProtectedRoute";
import Link from "next/link";

function DashboardContent() {
  const { user, token, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch("/projects", { token })
      .then(setProjects)
      .catch((e) => setError(e.message));
  }, [token]);

  async function createProject(e) {
  e.preventDefault();
  setCreating(true);
  setError("");
  try {
    await apiFetch("/projects", { method: "POST", token, body: newProject });
    setNewProject({ name: "", description: "" });
    setShowForm(false);
    const fresh = await apiFetch("/projects", { token });
    setProjects(fresh);
  } catch (e) {
    setError(e.message);
  } finally {
    setCreating(false);
  }
}

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

      {(user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER") && (
  <section className="mb-8 p-4 bg-white rounded-lg shadow-sm border">
    {!showForm ? (
      <button onClick={() => setShowForm(true)} className="text-sm underline">
        + New Project
      </button>
    ) : (
      <form onSubmit={createProject} className="space-y-3">
        <input
          placeholder="Project name"
          required
          value={newProject.name}
          onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
          className="w-full border rounded-md px-3 py-2"
        />
        <textarea
          placeholder="Description (optional)"
          value={newProject.description}
          onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
          className="w-full border rounded-md px-3 py-2"
        />
        <div className="flex gap-2">
          <button
            disabled={creating}
            className="bg-black text-white rounded-md px-4 py-2 text-sm disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-sm px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    )}
  </section>
)}

      <section>
        <h2 className="font-medium mb-3">
          {user?.role === "TEAM_MEMBER" ? "Your projects" : "All projects"}
        </h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid gap-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="p-4 bg-white rounded-lg shadow-sm border block hover:shadow-md transition">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">{p.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {p._count?.tasks ?? 0} tasks &middot; {p.members?.length ?? 0} members
              </p>
            </Link>
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