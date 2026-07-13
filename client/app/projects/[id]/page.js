 "use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";
import ProtectedRoute from "../../../components/ProtectedRoute";

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

function ProjectDetailContent() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const [newTask, setNewTask] = useState({ title: "", assigneeId: "" });
  const [creating, setCreating] = useState(false);

  const canManage = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  function loadProject() {
    apiFetch(`/projects/${id}`, { token })
      .then(setProject)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (token) loadProject();
  }, [token, id]);

  async function updateStatus(taskId, status) {
    try {
      await apiFetch(`/tasks/${taskId}/status`, {
        method: "PATCH",
        token,
        body: { status },
      });
      loadProject();
    } catch (e) {
      setError(e.message);
    }
  }

  async function createTask(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await apiFetch("/tasks", {
        method: "POST",
        token,
        body: {
          projectId: id,
          title: newTask.title,
          assigneeId: newTask.assigneeId || undefined,
        },
      });
      setNewTask({ title: "", assigneeId: "" });
      loadProject();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!project) return <p className="p-8">Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-1">{project.name}</h1>
      <p className="text-gray-500 mb-6">{project.description}</p>

      <section className="mb-8">
        <h2 className="font-medium mb-2">Members</h2>
        <div className="flex flex-wrap gap-2">
          {project.members.map((m) => (
            <span key={m.id} className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              {m.user.name}
            </span>
          ))}
        </div>
      </section>

      {canManage && (
        <section className="mb-8 p-4 bg-white border rounded-lg">
          <h2 className="font-medium mb-3">Add a task</h2>
          <form onSubmit={createTask} className="flex gap-2 flex-wrap">
            <input
              placeholder="Task title"
              required
              value={newTask.title}
              onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
              className="border rounded-md px-3 py-2 flex-1 min-w-[200px]"
            />
            <select
              value={newTask.assigneeId}
              onChange={(e) => setNewTask((t) => ({ ...t, assigneeId: e.target.value }))}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Unassigned</option>
              {project.members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </select>
            <button
              disabled={creating}
              className="bg-black text-white rounded-md px-4 py-2 disabled:opacity-50"
            >
              {creating ? "Adding..." : "Add Task"}
            </button>
          </form>
        </section>
      )}

      <section>
        <h2 className="font-medium mb-3">Tasks</h2>
        <div className="grid gap-3">
          {project.tasks.map((task) => {
            const canUpdateStatus = canManage || task.assignee?.id === user?.id;
            return (
              <div key={task.id} className="p-4 bg-white border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-gray-400">
                    {task.assignee ? `Assigned to ${task.assignee.name}` : "Unassigned"}
                  </p>
                </div>
                {canUpdateStatus ? (
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value)}
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-gray-500">{task.status}</span>
                )}
              </div>
            );
          })}
          {project.tasks.length === 0 && (
            <p className="text-sm text-gray-500">No tasks yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute>
      <ProjectDetailContent />
    </ProtectedRoute>
  );
}