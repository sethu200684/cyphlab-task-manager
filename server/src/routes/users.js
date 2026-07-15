const express = require("express");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const router = express.Router();

// List all users — Admin only
router.get("/", requireAuth, requireRole(["ADMIN", "PROJECT_MANAGER"]), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

// Update a user's role — Admin only
const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"]),
});

router.patch("/:id/role", requireAuth, requireRole(["ADMIN"]), async (req, res) => {
  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(user);
});

// Get current logged-in user's profile
router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  res.json(user);
});

module.exports = router;