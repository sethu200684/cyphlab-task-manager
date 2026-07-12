const express = require("express");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const router = express.Router();

// Create a task on a project — Admin or Project Manager only
const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

router.post("/", requireAuth, requireRole(["ADMIN", "PROJECT_MANAGER"]), async (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { projectId, title, description, assigneeId, dueDate } = parsed.data;

  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description,
      assigneeId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      creatorId: req.user.id,
    },
  });
  res.status(201).json(task);
});

// Update task status — assignee, PM, or Admin.
// Team Members can only update status on tasks assigned to them.
const updateStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  const isOwnerOrPM = ["ADMIN", "PROJECT_MANAGER"].includes(req.user.role);
  const isAssignee = task.assigneeId === req.user.id;

  if (!isOwnerOrPM && !isAssignee) {
    return res.status(403).json({ error: "You can only update tasks assigned to you" });
  }

  const updated = await prisma.task.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });
  res.json(updated);
});

// Full task edit — Admin or Project Manager only
const editTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

router.patch("/:id", requireAuth, requireRole(["ADMIN", "PROJECT_MANAGER"]), async (req, res) => {
  const parsed = editTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = { ...parsed.data };
  if (data.dueDate) data.dueDate = new Date(data.dueDate);

  const updated = await prisma.task.update({ where: { id: req.params.id }, data });
  res.json(updated);
});

// List tasks assigned to the current user
router.get("/mine", requireAuth, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { assigneeId: req.user.id },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { dueDate: "asc" },
  });
  res.json(tasks);
});

module.exports = router;