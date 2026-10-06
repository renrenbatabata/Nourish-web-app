"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";
import { errorMessage } from "../lib/errors";
export function useAuth(requireAuth = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => { setError("ログインの確認に時間がかかっています。通信を確認して再読み込みしてください。"); setLoading(false); }, 15000);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      clearTimeout(timer); setUser(u); setError(""); setLoading(false);
      if (requireAuth && !u) router.replace("/login");
    }, e => { clearTimeout(timer); setError(errorMessage(e)); setLoading(false); });
    return () => { clearTimeout(timer); unsubscribe(); };
  }, [requireAuth, router]);
  return { user, loading, error };
}
