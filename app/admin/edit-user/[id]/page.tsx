"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "EMPLOYEE",
    employeeId: "",
    departmentId: "",
    phone: "",
    gender: "",
    title: "",
    yearsExperience: "",
    hireDate: "",
    isActive: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    if (!token) {
      router.push("/login");
      return;
    }
    // Load departments
    fetch("/api/departments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDepartments(data.data);
      })
      .catch(console.error);
    // Load user data
    fetch(`/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const u = data.data;
          setForm({
            name: u.name || "",
            email: u.email || "",
            role: u.role || "EMPLOYEE",
            employeeId: u.employeeId || "",
            departmentId: u.departmentId || "",
            phone: u.phone || "",
            gender: u.gender || "",
            title: u.title || "",
            yearsExperience: u.yearsExperience?.toString() || "",
            hireDate: u.hireDate ? u.hireDate.split("T")[0] : "",
            isActive: !!u.is_active,
          });
        } else {
          setError(data.message || "Failed to load user");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error loading user");
        setLoading(false);
      });
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          departmentId: form.departmentId || null,
          phone: form.phone || null,
          gender: form.gender || null,
          title: form.title || null,
          yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : null,
          hireDate: form.hireDate || null,
          is_active: form.isActive ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        setError(data.message || "Failed to update user");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this user permanently? This cannot be undone.")) return;
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        alert(data.message || "Delete failed");
      }
    } catch {
      alert("Network error");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading user...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Full Name *</Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label>Role *</Label>
          <select
            className="w-full border rounded p-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <Label>Employee ID (read‑only)</Label>
          <Input value={form.employeeId} disabled readOnly className="bg-gray-100" />
        </div>
        <div>
          <Label>Department</Label>
          <select
            className="w-full border rounded p-2"
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <Label>Gender</Label>
          <select
            className="w-full border rounded p-2"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <Label>Job Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Years of Experience</Label>
          <Input
            type="number"
            value={form.yearsExperience}
            onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
          />
        </div>
        <div>
          <Label>Hire Date</Label>
          <Input
            type="date"
            value={form.hireDate}
            onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="w-4 h-4"
          />
          <Label>Active (can log in)</Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" onClick={handleDelete} variant="destructive" className="flex-1">
            Delete User
          </Button>
        </div>
      </form>
    </div>
  );
}