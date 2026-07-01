"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, User, Clock, Key, UserPlus,
  Trash2, CheckCircle, XCircle, RefreshCw, AlertCircle, Edit,
} from 'lucide-react';
import { getRoleColor } from '../utils/roleColor';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';


console.log("=== NEXT.JS ENV DEBUG ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_INSTANCE:", process.env.DB_INSTANCE);
console.log("=========================");


// Types
interface DbUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  is_active: boolean | number;
  is_deleted?: boolean | number;
  employeeId?: string;
  departmentId?: string;
  phone?: string;
  gender?: string;
  title?: string;
  yearsExperience?: number;
  hireDate?: string;
}

interface PasswordRequest {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}


type ActiveTab = 'overview' | 'management' | 'requests';

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  'bg-yellow-50 text-yellow-800 border border-yellow-250 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/50',
    approved: 'bg-emerald-50 text-emerald-800 border border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    rejected: 'bg-red-50 text-red-800 border border-red-250 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    active:   'bg-emerald-50 text-emerald-800 border border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    inactive: 'bg-red-50 text-red-800 border border-red-250 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const [users,      setUsers]      = useState<DbUser[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<DbUser[]>([]);
  const [requests,   setRequests]   = useState<PasswordRequest[]>([]);
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [reqLoading, setReqLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // Add user modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser,     setNewUser]     = useState({ name: '', email: '', role: 'employee', password: '' });
  const [addingUser,  setAddingUser]  = useState(false);

  // Edit user modal
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<DbUser | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<DbUser | null>(null);
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // ── Fetchers with token ─────────────────────────────────────────────────
  const fetchPendingRegistrationsCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const BACKEND = BASE.endsWith('/api') ? BASE : `${BASE}/api`;
      const res = await fetch(`${BACKEND}/auth/registrations?status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success) {
        const requestsFromApi = data?.requests ?? data?.data?.requests ?? [];
        setPendingRegistrationsCount(requestsFromApi.length);
      }
    } catch (err) {
      console.error("Failed to fetch pending registration count:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      // API contract (backend):
      // { success: true, data: { users: [...], stats: {...} } }
      // But some implementations may return an array directly.

      const usersData = data?.success ? data?.data : data;

      const normalizedUsers = Array.isArray(usersData)
        ? usersData
        : Array.isArray((usersData as any)?.users)
          ? (usersData as any).users
          : [];

      if (normalizedUsers.length > 0 || (usersData && typeof usersData === 'object')) {
        setUsers(normalizedUsers);
      } else {
        showToast('Failed to load users: invalid format.', 'err');
        setUsers([]);
      }
    } catch {
      showToast('Network error while loading users.', 'err');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchRequests = useCallback(async () => {
    // Pending password requests
    setReqLoading(true);
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/admin/password-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data?.success) {
        const requestsFromApi = data?.data ?? [];
        const mapped = (requestsFromApi ?? []).map((r: any) => ({
          id: String(r.id),
          user_id: String(r.userId),
          user_name: r.name || 'User',
          email: r.email,
          role: 'User',
          status: (r.status || '').toString().toLowerCase(),
          requested_at: r.requestedAt,
          resolved_at: r.resolvedAt,
          resolved_by: null,
        }));
        setRequests(mapped);
      } else {
        showToast(data?.message || 'Failed to load password requests', 'err');
      }
    } catch {
      showToast('Network error while loading password requests.', 'err');
    } finally {
      setReqLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchPendingRegistrationsCount();
  }, [fetchUsers, fetchRequests, fetchPendingRegistrationsCount]);

  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleResolveRequest = async (id: string, action: 'approve' | 'reject') => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/password-requests/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });
      const data = await res.json();
      showToast(data.message ?? (data.success ? 'Done.' : 'Action failed.'), data.success ? 'ok' : 'err');
      if (data.success) fetchRequests();
    } catch {
      showToast('Network error.', 'err');
    }
  };

  const handleDeleteUser = async (user: DbUser) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${user.name} removed.`, 'ok');
        fetchUsers();
      } else {
        showToast(data.message ?? 'Delete failed.', 'err');
      }
    } catch {
      showToast('Network error.', 'err');
    } finally {
      setDeleteTarget(null);
    }
  };

  const fetchDeletedUsers = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/users?includeDeleted=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const usersData = data?.success ? data?.data : data;

      const normalizedUsers = Array.isArray(usersData)
        ? usersData
        : Array.isArray((usersData as any)?.users)
          ? (usersData as any).users
          : [];

      const mapped = normalizedUsers.map((u: any) => ({
        id: String(u.id),
        email: u.email,
        name: u.name,
        role: u.role,
        is_active: 0,
        is_deleted: true,
        employeeId: u.employeeId,
        departmentId: u.departmentId,
        phone: u.phone,
        gender: u.gender,
        title: u.title,
        yearsExperience: u.yearsExperience,
        hireDate: u.hireDate,
      }));
      setDeletedUsers(mapped);
    } catch {
      showToast('Network error while loading deleted employees.', 'err');
    }
  }, []);

  const handleRestoreUser = async (user: DbUser) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${user.name} restored successfully.`, 'ok');
        fetchUsers();
        fetchDeletedUsers();
      } else {
        showToast(data.message ?? 'Restore failed.', 'err');
      }
    } catch {
      showToast('Network error.', 'err');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.success) {
        showToast('User added successfully.', 'ok');
        setNewUser({ name: '', email: '', role: 'employee', password: '' });
        setShowAddUser(false);
        fetchUsers();
      } else {
        showToast(data.message ?? 'Failed to add user.', 'err');
      }
    } catch {
      showToast('Network error.', 'err');
    } finally {
      setAddingUser(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdatingUser(true);
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          is_active: editingUser.is_active ? 1 : 0,
          employeeId: editingUser.employeeId,
          departmentId: editingUser.departmentId,
          phone: editingUser.phone,
          gender: editingUser.gender,
          title: editingUser.title,
          yearsExperience: editingUser.yearsExperience,
          hireDate: editingUser.hireDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('User updated successfully.', 'ok');
        setShowEditUser(false);
        fetchUsers();
      } else {
        showToast(data.message ?? 'Update failed.', 'err');
      }
    } catch {
      showToast('Network error.', 'err');
    } finally {
      setUpdatingUser(false);
    }
  };

  const pendingPasswordCount = requests.filter((r) => r.status === 'pending').length;

  const activeUsers = users.filter(u => !u.is_deleted);

  const adminCount = activeUsers.filter(
    (u) => (u.role ?? '').toString().toLowerCase() === 'admin'
  ).length;
  const managerCount = activeUsers.filter(
    (u) => (u.role ?? '').toString().toLowerCase() === 'manager'
  ).length;

  // ── Render (FULL JSX – same as your original) ───────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-950 to-gray-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Account &amp; Access Management</p>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Users',      value: activeUsers.length, Icon: Users,  hi: false },
            { label: 'Admins',           value: adminCount,   Icon: Shield, hi: false },
            { label: 'Managers',         value: managerCount, Icon: User,   hi: false },
            { label: 'Pending Requests', value: pendingRegistrationsCount, Icon: Clock,  hi: pendingRegistrationsCount > 0 },
          ].map(({ label, value, Icon, hi }) => {
            const isPendingCard = label === 'Pending Requests';
            return (
              <div
                key={label}
                role={isPendingCard ? 'button' : undefined}
                tabIndex={isPendingCard ? 0 : undefined}
                onClick={() => {
                  if (!isPendingCard) return;
                  router.push('/admin/approvals/pending-requests');
                }}
                onKeyDown={(e) => {
                  if (!isPendingCard) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    router.push('/admin/approvals/pending-requests');
                  }
                }}
                aria-label={isPendingCard ? 'Open pending requests' : undefined}
                className={`rounded-xl p-5 border flex items-center justify-between shadow-sm transition-all duration-300
                  ${hi 
                    ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30' 
                    : 'bg-white dark:bg-gray-950 border-slate-200/80 dark:border-slate-800/80'}
                  ${isPendingCard ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''}`}
              >
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1 font-semibold uppercase tracking-wider">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <Icon className={`w-8 h-8 ${hi ? 'text-yellow-600 dark:text-yellow-450' : 'text-blue-600/80 dark:text-blue-400/80'}`} />
              </div>
            );
          })}
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-1 w-fit">
          {([
            { id: 'overview',   label: 'Users Overview'    },
            { id: 'management', label: 'Account Management' },
            { id: 'requests',   label: `Password Requests${pendingPasswordCount > 0 ? ` (${pendingPasswordCount})` : ''}` },
          ] as { id: ActiveTab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                  : 'text-gray-650 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="bg-white dark:bg-gray-950 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Users</h2>
                <button onClick={fetchUsers} className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-250 transition-colors" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading...</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/40">
                      <tr>
                        {['#', 'Name', 'Email', 'Role', 'Status'].map(h => (
                          <th key={h} className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold tracking-wider uppercase text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeUsers.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400 dark:text-gray-600">No users found.</td></tr>
                      )}
                      {activeUsers.map((u, i) => (
                        <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="p-4 text-gray-400 dark:text-gray-600">{i + 1}</td>
                          <td className="p-4 text-gray-900 dark:text-white font-bold">{u.name}</td>
                          <td className="p-4 text-gray-655 dark:text-gray-300 font-medium">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleColor(u.role)}`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={u.is_active === false ? 'inactive' : 'active'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}

          {/* Account Management Tab */}
          {activeTab === 'management' && (
            <motion.div key="management"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="bg-white dark:bg-gray-950 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Account Management</h2>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => setShowAddUser(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-750 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition-colors border-0"
                  >
                    <UserPlus className="w-4 h-4" /><span>Add User</span>
                  </Button>
                  <Button
                    onClick={() => {
                      fetchDeletedUsers();
                      setShowDeletedModal(true);
                    }}
                    variant="outline"
                    className="flex items-center space-x-2 px-4 py-2 border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /><span>Deleted Employees</span>
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading...</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/40">
                      <tr>
                        {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold tracking-wider uppercase text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeUsers.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400 dark:text-gray-600">No users found.</td></tr>
                      )}
                      {activeUsers.map(u => (
                        <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="p-4 text-gray-900 dark:text-white font-bold">{u.name}</td>
                          <td className="p-4 text-gray-655 dark:text-gray-300 font-medium">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleColor(u.role)}`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={u.is_active === false ? 'inactive' : 'active'} />
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setShowEditUser(true);
                                }}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 transition-colors"
                                title="Edit user"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(u)}
                                className="p-1.5 rounded-lg text-red-655 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(`/admin/reset-password?email=${encodeURIComponent(u.email)}`, '_blank')}
                                className="p-1.5 rounded-lg text-amber-655 hover:bg-amber-50 dark:text-amber-405 dark:hover:bg-amber-950/40 transition-colors"
                                title="Admin reset password"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}

          {/* Password Requests Tab */}
          {activeTab === 'requests' && (
            <motion.div key="requests"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="bg-white dark:bg-gray-950 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Password Change Requests</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Approve or reject user-submitted password changes</p>
                </div>
                <button onClick={fetchRequests} className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-250 transition-colors" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                {reqLoading ? (
                  <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading...</div>
                ) : requests.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 dark:text-gray-600">No password change requests yet.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/40">
                      <tr>
                        {['User', 'Email', 'Role', 'Requested At', 'Status', 'Resolved By', 'Actions'].map(h => (
                          <th key={h} className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold tracking-wider uppercase text-xs whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(r => (
                        <tr
                          key={r.id}
                          className={`border-t border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 ${r.status === 'pending' ? 'bg-yellow-500/5' : ''}`}
                        >
                          <td className="p-4 text-gray-900 dark:text-white font-bold">{r.user_name}</td>
                          <td className="p-4 text-gray-655 dark:text-gray-300 font-medium">{r.email}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleColor(r.role as any)}`}>
                              {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(r.requested_at)}</td>
                          <td className="p-4"><StatusBadge status={r.status} /></td>
                          <td className="p-4 text-gray-500 dark:text-gray-450 text-xs">{r.resolved_by ?? '—'}</td>
                          <td className="p-4">
                            {r.status === 'pending' ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleResolveRequest(r.id, 'approve')}
                                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow transition-colors border-0"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /><span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleResolveRequest(r.id, 'reject')}
                                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-750 text-white text-xs font-semibold shadow transition-colors border-0"
                                >
                                  <XCircle className="w-3.5 h-3.5" /><span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-650 text-xs">Resolved {fmtDate(r.resolved_at)}</span>
                            )}
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${
              toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-red-650 text-white'
            }`}
          >
            {toast.type === 'ok'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New User</h3>
              <button onClick={() => setShowAddUser(false)} className="text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <Label className="text-gray-750 dark:text-gray-300 font-semibold text-sm">Full Name</Label>
                <Input type="text" value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Ali Raza" required
                  className="mt-1 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400" />
              </div>
              <div>
                <Label className="text-gray-750 dark:text-gray-300 font-semibold text-sm">Email</Label>
                <Input type="email" value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@dawlance.com" required
                  className="mt-1 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400" />
              </div>
              <div>
                <Label className="text-gray-750 dark:text-gray-300 font-semibold text-sm">Temporary Password</Label>
                <Input type="password" value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Min. 6 characters" required minLength={6}
                  className="mt-1 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400" />
              </div>
              <div>
                <Label className="text-gray-750 dark:text-gray-300 font-semibold text-sm">Role</Label>
                <select value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 w-full p-2.5 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="employee" className="text-gray-900">Employee</option>
                  <option value="manager" className="text-gray-900">Manager</option>
                  <option value="admin" className="text-gray-900">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddUser(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-sm font-semibold transition-colors border-0">
                  Cancel
                </button>
                <button type="submit" disabled={addingUser}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow transition-colors disabled:opacity-60 border-0">
                  {addingUser ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit User</h3>
              <button onClick={() => setShowEditUser(false)} className="text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <Label className="text-gray-750 dark:text-gray-300 font-semibold text-sm">Full Name</Label>
                <Input type="text" value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                  className="mt-1 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div>
                <Label className="text-gray-750 dark:text-gray-300 font-semibold text-sm">Email</Label>
                <Input type="email" value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                  className="mt-1 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div>
                <Label className="text-gray-750 dark:text-gray-300 font-semibold text-sm">Role</Label>
                <select value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="mt-1 w-full p-2.5 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="employee" className="text-gray-900">Employee</option>
                  <option value="manager" className="text-gray-900">Manager</option>
                  <option value="admin" className="text-gray-900">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingUser.is_active === true || editingUser.is_active === 1}
                  onChange={e => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-350"
                />
                <Label className="text-gray-750 dark:text-gray-300 font-semibold text-sm">Active (can log in)</Label>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowEditUser(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-sm font-semibold transition-colors border-0">
                  Cancel
                </button>
                <button type="submit" disabled={updatingUser}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition-colors disabled:opacity-60 border-0">
                  {updatingUser ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Delete User</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
              Remove <span className="text-gray-900 dark:text-white font-semibold">{deleteTarget.name}</span> ({deleteTarget.email})? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-sm font-semibold transition-colors border-0">
                Cancel
              </button>
              <button onClick={() => handleDeleteUser(deleteTarget)}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-750 text-white text-sm font-bold shadow transition-colors border-0">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Deleted Employees Modal */}
      {showDeletedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-950 rounded-2xl p-6 w-full max-w-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Deleted Employees</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">List of soft-deleted user accounts. You can restore them below.</p>
              </div>
              <button onClick={() => setShowDeletedModal(false)} className="text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250 text-xl leading-none border-0 bg-transparent">&times;</button>
            </div>
            
            <div className="overflow-y-auto flex-1 border border-slate-100 dark:border-slate-800/80 rounded-xl">
              {deletedUsers.length === 0 ? (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400">No deleted employees found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/40 sticky top-0">
                    <tr>
                      {['Name', 'Email', 'Role', 'Actions'].map(h => (
                        <th key={h} className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold tracking-wider uppercase text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deletedUsers.map(u => (
                      <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="p-4 text-gray-900 dark:text-white font-bold">{u.name}</td>
                        <td className="p-4 text-gray-655 dark:text-gray-300 font-medium">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleColor(u.role)}`}>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button
                            onClick={() => {
                              handleRestoreUser(u);
                              setShowDeletedModal(false);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors border-0 px-3 py-1.5 h-auto cursor-pointer"
                          >
                            Restore
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <Button onClick={() => setShowDeletedModal(false)}
                className="py-2 px-5 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-sm font-semibold transition-colors border-0">
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}