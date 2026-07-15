"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.push(token ? "/dashboard" : "/login");
  }, [loading, token, router]);

  return <main className="min-h-screen flex items-center justify-center">Loading...</main>;
}