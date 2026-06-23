"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  created_at: string;
}

export default function ApproveRegistrationsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPending = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/admin/pending-registrations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else setError(data.message);
    } catch {
      setError("Failed to load pending registrations");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/approve-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        alert(data.message);
      }
    } catch {
      alert("Approval failed");
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading pending registrations...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending User Registrations</h1>
      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No pending registrations</div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-xs text-gray-400">
                  Role: {user.role} • Employee ID: {user.employeeId || "-"} • Requested:{" "}
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
              <Button onClick={() => approveUser(user.id)}>Approve</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}