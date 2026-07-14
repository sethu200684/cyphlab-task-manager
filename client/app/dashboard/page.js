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
  const [taskStats, setTaskStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadStats() {
    try {
      const mine = await apiFetch("/tasks/mine", { token });
      const counts = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
      mine.forEach((t) => {
        counts[t.status] = (counts[t.status] || 0) + 1;
      });
      setTaskStats(counts);
    } catch (e) {
      // silently ignore, stats are non-critical
    }
  }

  useEffect(() => {
    if (!token) return;
    apiFetch("/projects", { token })
      .then(setProjects)
      .catch((e) => setError(e.message));
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {taskStats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-white border rounded-lg text-center">
            <p className="text-2xl font-semibold">{taskStats.TODO}</p>
            <p className="text-xs text-gray-500">To Do</p>
          </div>
          <div className="p-3 bg-white border rounded-lg text-center">
            <p className="text-2xl font-semibold">{taskStats.IN_PROGRESS}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
          <div className="p-3 bg-white border rounded-lg text-center">
            <p className="text-2xl font-semibold">{taskStats.IN_REVIEW}</p>
            <p className="text-xs text-gray-500">In Review</p>
          </div>
          <div className="p-3 bg-white border rounded-lg text-center">
            <p className="text-2xl font-semibold">{taskStats.DONE}</p>
            <p className="text-xs text-gray-500">Done</p>
          </div>
        </div>
      )}

      {user?.role === "ADMIN" && (
        <Link href="/admin/users" className="text-sm underline block mb-6">
          Manage Users →
        </Link>
      )}

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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md py-2 disabled:opacity-50 transition"
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

      <input
        type="text"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border rounded-md px-3 py-2 mb-4"
      />

      <section>
        <h2 className="font-medium mb-3">
          {user?.role === "TEAM_MEMBER" ? "Your projects" : "All projects"}
        </h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid gap-3">
          {filteredProjects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="p-4 bg-white rounded-lg shadow-sm border block hover:shadow-md transition"
            >
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">{p.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {p._count?.tasks ?? 0} tasks &middot; {p.members?.length ?? 0} members
              </p>
            </Link>
          ))}
          {filteredProjects.length === 0 && !error && (
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