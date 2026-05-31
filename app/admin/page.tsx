"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, User, Clock, Key, LogOut, UserPlus,
  Trash2, CheckCircle, XCircle, RefreshCw, AlertCircle,
} from 'lucide-react';
import { getRoleColor } from '../utils/roleColor';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DbUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  is_active: boolean | null;
}

interface PasswordRequest {
  id: number;
  user_id: number;
  user_name: string;
  email: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

type ActiveTab = 'overview' | 'management' | 'requests';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40',
    approved: 'bg-green-400/20  text-green-300  border border-green-400/40',
    rejected: 'bg-red-400/20    text-red-300    border border-red-400/40',
    active:   'bg-green-400/20  text-green-300  border border-green-400/40',
    inactive: 'bg-red-400/20    text-red-300    border border-red-400/40',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-white/10 text-white/60'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const [users,      setUsers]      = useState<DbUser[]>([]);
  const [requests,   setRequests]   = useState<PasswordRequest[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [reqLoading, setReqLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser,     setNewUser]     = useState({ name: '', email: '', role: 'user', password: '' });
  const [addingUser,  setAddingUser]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DbUser | null>(null);

  // ── Fetchers ─────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success) setUsers(data.users ?? []);
    } catch { showToast('Failed to load users.', 'err'); }
    finally   { setLoading(false); }
  }, []);

  const fetchRequests = useCallback(async () => {
    setReqLoading(true);
    try {
      const res  = await fetch('/api/auth/password-change-requests');
      const data = await res.json();
      if (data.success) setRequests(data.requests ?? []);
    } catch { showToast('Failed to load requests.', 'err'); }
    finally   { setReqLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); fetchRequests(); }, [fetchUsers, fetchRequests]);

  // ── Toast ─────────────────────────────────────────────────────────────────

  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleResolveRequest = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res  = await fetch(`/api/auth/password-change-requests/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action, adminEmail: 'admin@dawlance.com' }),
      });
      const data = await res.json();
      showToast(data.message ?? (data.success ? 'Done.' : 'Action failed.'), data.success ? 'ok' : 'err');
      if (data.success) fetchRequests();
    } catch { showToast('Network error.', 'err'); }
  };

  const handleDeleteUser = async (user: DbUser) => {
    try {
      const res  = await fetch('/api/auth/users', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: user.id }),
      });
      const data = await res.json().catch(() => ({ success: true }));
      if (!res.ok && !data.success) {
        showToast(data.message ?? 'Delete failed.', 'err');
      } else {
        showToast(`${user.name} removed.`, 'ok');
        fetchUsers();
      }
    } catch { showToast('Network error.', 'err'); }
    finally   { setDeleteTarget(null); }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(newUser),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || data.success) {
        showToast('User added successfully.', 'ok');
        setNewUser({ name: '', email: '', role: 'user', password: '' });
        setShowAddUser(false);
        fetchUsers();
      } else {
        showToast(data.message ?? 'Failed to add user.', 'err');
      }
    } catch { showToast('Network error.', 'err'); }
    finally   { setAddingUser(false); }
  };

  // ── Derived counts ────────────────────────────────────────────────────────

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const adminCount   = users.filter(u => u.role === 'admin').length;
  const managerCount = users.filter(u => u.role === 'manager').length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950">
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/50 text-sm">Account &amp; Access Management</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('userSession'); window.location.href = '/login'; }}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /><span>Logout</span>
          </button>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Users',      value: users.length, Icon: Users,  hi: false },
            { label: 'Admins',           value: adminCount,   Icon: Shield, hi: false },
            { label: 'Managers',         value: managerCount, Icon: User,   hi: false },
            { label: 'Pending Requests', value: pendingCount, Icon: Clock,  hi: pendingCount > 0 },
          ].map(({ label, value, Icon, hi }) => (
            <div
              key={label}
              className={`rounded-xl p-5 border flex items-center justify-between
                ${hi ? 'bg-yellow-500/20 border-yellow-400/40' : 'bg-white/10 border-white/20'}`}
            >
              <div>
                <p className="text-white/60 text-xs mb-1">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
              <Icon className={`w-8 h-8 ${hi ? 'text-yellow-300' : 'text-white/40'}`} />
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
          {([
            { id: 'overview',   label: 'Users Overview'    },
            { id: 'management', label: 'Account Management' },
            { id: 'requests',   label: `Password Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          ] as { id: ActiveTab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-900 shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <AnimatePresence mode="wait">

          {/* 1. Users Overview */}
          {activeTab === 'overview' && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
            >
              <div className="p-5 border-b border-white/20 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">All Users</h2>
                <button onClick={fetchUsers} className="text-white/50 hover:text-white transition-colors" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-10 text-center text-white/50">Loading...</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        {['#', 'Name', 'Email', 'Role', 'Status'].map(h => (
                          <th key={h} className="text-left p-4 text-white/70 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-white/40">No users found.</td></tr>
                      )}
                      {users.map((u, i) => (
                        <tr key={u.id} className="border-t border-white/10 hover:bg-white/5">
                          <td className="p-4 text-white/40">{i + 1}</td>
                          <td className="p-4 text-white font-medium">{u.name}</td>
                          <td className="p-4 text-white/70">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(u.role)}`}>
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

          {/* 2. Account Management */}
          {activeTab === 'management' && (
            <motion.div key="management"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
            >
              <div className="p-5 border-b border-white/20 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Account Management</h2>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                >
                  <UserPlus className="w-4 h-4" /><span>Add User</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-10 text-center text-white/50">Loading...</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left p-4 text-white/70 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-white/40">No users found.</td></tr>
                      )}
                      {users.map(u => (
                        <tr key={u.id} className="border-t border-white/10 hover:bg-white/5">
                          <td className="p-4 text-white font-medium">{u.name}</td>
                          <td className="p-4 text-white/70">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(u.role)}`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={u.is_active === false ? 'inactive' : 'active'} />
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setDeleteTarget(u)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(`/reset-password?email=${encodeURIComponent(u.email)}`, '_blank')}
                                className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
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

          {/* 3. Password Change Requests */}
          {activeTab === 'requests' && (
            <motion.div key="requests"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
            >
              <div className="p-5 border-b border-white/20 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">Password Change Requests</h2>
                  <p className="text-white/50 text-xs mt-0.5">Approve or reject user-submitted password changes</p>
                </div>
                <button onClick={fetchRequests} className="text-white/50 hover:text-white transition-colors" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                {reqLoading ? (
                  <div className="p-10 text-center text-white/50">Loading...</div>
                ) : requests.length === 0 ? (
                  <div className="p-10 text-center text-white/40">No password change requests yet.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        {['User', 'Email', 'Role', 'Requested At', 'Status', 'Resolved By', 'Actions'].map(h => (
                          <th key={h} className="text-left p-4 text-white/70 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(r => (
                        <tr
                          key={r.id}
                          className={`border-t border-white/10 hover:bg-white/5 ${r.status === 'pending' ? 'bg-yellow-500/5' : ''}`}
                        >
                          <td className="p-4 text-white font-medium">{r.user_name}</td>
                          <td className="p-4 text-white/70">{r.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(r.role as 'admin' | 'manager' | 'user')}`}>
                              {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-white/60 whitespace-nowrap">{fmtDate(r.requested_at)}</td>
                          <td className="p-4"><StatusBadge status={r.status} /></td>
                          <td className="p-4 text-white/50 text-xs">{r.resolved_by ?? '—'}</td>
                          <td className="p-4">
                            {r.status === 'pending' ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleResolveRequest(r.id, 'approve')}
                                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-green-600/80 hover:bg-green-600 text-white text-xs font-medium transition-colors"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /><span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleResolveRequest(r.id, 'reject')}
                                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" /><span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-white/30 text-xs">Resolved {fmtDate(r.resolved_at)}</span>
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
          <motion.div key="toast"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${
              toast.type === 'ok' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'
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
            className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-white">Add New User</h3>
              <button onClick={() => setShowAddUser(false)} className="text-white/50 hover:text-white text-xl leading-none">x</button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <Label className="text-white/80 text-sm">Full Name</Label>
                <Input type="text" value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Ali Raza" required
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              </div>
              <div>
                <Label className="text-white/80 text-sm">Email</Label>
                <Input type="email" value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@dawlance.com" required
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              </div>
              <div>
                <Label className="text-white/80 text-sm">Temporary Password</Label>
                <Input type="password" value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Min. 6 characters" required minLength={6}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              </div>
              <div>
                <Label className="text-white/80 text-sm">Role</Label>
                <select value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 w-full p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                >
                  <option value="user">User (Employee)</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddUser(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={addingUser}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
                  {addingUser ? 'Adding...' : 'Add User'}
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
            className="bg-gradient-to-br from-red-900 to-rose-900 rounded-2xl p-6 w-full max-w-sm border border-white/20 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Delete User</h3>
            <p className="text-white/70 text-sm mb-5">
              Remove <span className="text-white font-medium">{deleteTarget.name}</span> ({deleteTarget.email})? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDeleteUser(deleteTarget)}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
