"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (roles && !roles.includes(user?.role)) {
      router.push("/dashboard");
    }
  }, [loading, token, user, roles, router]);

  if (loading || !token) return <p className="p-8">Loading...</p>;
  if (roles && !roles.includes(user?.role)) return null;

  return children;
}