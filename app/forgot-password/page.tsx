"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";   // ✅ added missing import
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff, Key, ShieldCheck, ChevronDown, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();   // now works
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const floatingShapes = [
    { id: 1, size: "w-20 h-20", position: "top-20 left-20", delay: 0 },
    { id: 2, size: "w-16 h-16", position: "top-40 right-32", delay: 0.5 },
    { id: 3, size: "w-24 h-24", position: "bottom-32 left-16", delay: 1 },
    { id: 4, size: "w-12 h-12", position: "bottom-20 right-20", delay: 1.5 },
    { id: 5, size: "w-8 h-8", position: "top-60 left-1/3", delay: 2 },
  ];

  const roles = [
    { value: "employee", label: "Employee", icon: "👤" },
    { value: "manager", label: "Manager", icon: "👔" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/password-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.message || "Failed to send reset request. Please contact admin directly.");
      }
    } catch {
      setError("Network error. Could not reach server.");
    } finally {
      setIsLoading(false);
    }
  };

  // After submission screen
  if (isSubmitted) {
    return (
      <div className="h-screen w-screen fixed top-0 left-0 m-0 p-0 overflow-hidden bg-gradient-to-br from-[#3B82F6] via-[#8B5CF6] to-[#1E40AF]">
        <div className="flex items-center justify-center w-full h-full p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-12 flex flex-col items-center justify-center text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
                >
                  <Send className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Request Sent to Admin!</h2>
                <p className="text-white/80">Your password reset request has been submitted.</p>
              </div>
              <div className="p-12 bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center">
                <ShieldCheck className="w-16 h-16 text-white/60 mb-6" />
                <p className="text-white text-center mb-6">
                  An administrator will review and process your password reset request.<br />
                  You will be notified once your password has been updated.
                </p>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#1D4ED8] hover:to-[#7C3AED] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
                    Return to Login →
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="h-screen w-screen fixed top-0 left-0 m-0 p-0 overflow-hidden bg-gradient-to-br from-[#3B82F6] via-[#8B5CF6] to-[#1E40AF]">
      {floatingShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.size} ${shape.position} rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm`}
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, delay: shape.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="flex items-center justify-center w-full h-full p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left side */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-12 flex flex-col items-center justify-center text-center text-white relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-8 left-8"
              >
                <div className="w-6 h-6 bg-yellow-300 rounded-full" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-12 right-12"
              >
                <div className="w-8 h-8 bg-white/30 rounded-full" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-16 left-16"
              >
                <div className="w-5 h-5 bg-purple-300 rounded-full" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative mb-8"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-2xl">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <ShieldCheck className="w-16 h-16 text-white" />
                  </motion.div>
                </div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-2xl font-bold mb-4"
              >
                Request Password Reset
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-white/80 text-lg"
              >
                Submit your request to the administrator
              </motion.p>
            </motion.div>

            {/* Right side form */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-12 bg-white/5 backdrop-blur-sm"
            >
              <div className="max-w-sm mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">Password Reset Request</h1>
                <div className="bg-white/10 rounded-lg p-3 mb-6 text-center">
                  <p className="text-white/80 text-sm">
                    Enter your email, role, and desired new password.<br />
                    An admin will review and update your credentials.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90 text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="pl-12 bg-white/10 border border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/20 h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-white/90 text-sm font-medium">Role</Label>
                    <div className="relative">
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 bg-white/10 border border-white/30 text-white rounded-xl appearance-none cursor-pointer focus:border-white/50"
                      >
                        {roles.map((r) => (
                          <option key={r.value} value={r.value} className="bg-gray-800 text-white">
                            {r.icon} {r.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 pointer-events-none" />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-white/60 text-lg">{roles.find(r => r.value === role)?.icon}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white/90 text-sm font-medium">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-12 pr-12 bg-white/10 border border-white/30 text-white placeholder:text-white/60 focus:border-white/50 h-12 rounded-xl"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white/90 text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-12 bg-white/10 border border-white/30 text-white placeholder:text-white/60 h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-center text-red-200 text-sm">{error}</div>}

                  <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#1D4ED8] hover:to-[#7C3AED] text-white font-semibold h-12 rounded-xl">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Request to Admin →"}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <Link href="/login" className="text-white/70 hover:text-white text-sm inline-flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}