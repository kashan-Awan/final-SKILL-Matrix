"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    employeeId: "",
    password: "",
    role: "employee",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          employeeId: form.employeeId || null,
          password: form.password,
          role: form.role.toUpperCase(),
          gender: form.gender || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: "Registration request submitted! Wait for admin approval.", type: "success" });
        setForm({ name: "", email: "", employeeId: "", password: "", role: "employee", gender: "" });
      } else {
        setMessage({ text: data.message || "Registration failed.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm">Skills Matrix – Dawlance</p>
        </div>
        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {message.text}
          </div>
        )}
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
            <Label>Employee ID (optional)</Label>
            <Input
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            />
          </div>
          <div>
            <Label>Gender *</Label>
            <select
              className="w-full border rounded p-2 text-sm bg-white cursor-pointer"
              required
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
            <Label>Password *</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <Label>Register as *</Label>
            <select
              className="w-full border rounded p-2"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Admin accounts can only be created by existing administrators.</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Create Account"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}