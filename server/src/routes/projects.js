const express = require("express");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const router = express.Router();

// List projects.
// Admin/PM see all projects; Team Members see only projects they're a member of.
router.get("/", requireAuth, async (req, res) => {
  const where =
    req.user.role === "TEAM_MEMBER"
      ? { members: { some: { userId: req.user.id } } }
      : {};

  const projects = await prisma.project.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(projects);
});

// Create a project — Admin or Project Manager only
const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

router.post("/", requireAuth, requireRole(["ADMIN", "PROJECT_MANAGER"]), async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      ownerId: req.user.id,
      members: { create: { userId: req.user.id } }, // owner is auto-added as a member
    },
    include: { members: true },
  });
  res.status(201).json(project);
});

module.exports = router;