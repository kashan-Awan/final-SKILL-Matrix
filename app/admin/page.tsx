"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, User, Clock, Key, LogOut, UserPlus,
  Trash2, CheckCircle, XCircle, RefreshCw, AlertCircle, Edit,
} from 'lucide-react';
import { getRoleColor } from '../utils/roleColor';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';


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

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const [users,      setUsers]      = useState<DbUser[]>([]);
  const [requests,   setRequests]   = useState<PasswordRequest[]>([]);
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

  const getToken = () => localStorage.getItem('token');

  // ── Fetchers with token ─────────────────────────────────────────────────
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
      
      // The API might be returning an array directly, or an object with a `data` property.
      const usersData = data.success ? data.data : data;

      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        showToast('Failed to load users: invalid format.', 'err');
        setUsers([]); // fallback to empty array
      }
    } catch {
      showToast('Network error while loading users.', 'err');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchRequests = useCallback(async () => {
    setReqLoading(true);
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('/api/admin/password-requests?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setRequests(data.data ?? []);
      else showToast(data.message || 'Failed to load requests', 'err');
    } catch {
      showToast('Network error while loading requests.', 'err');
    } finally {
      setReqLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, [fetchUsers, fetchRequests]);

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

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const adminCount   = users.filter(u => u.role === 'admin').length;
  const managerCount = users.filter(u => u.role === 'manager').length;

  // ── Render (FULL JSX – same as your original) ───────────────────────────
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
            onClick={() => {
              localStorage.removeItem('userSession');
              localStorage.removeItem('token');
              router.push('/login');
            }}
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

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
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

          {/* Account Management Tab */}
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
                                onClick={() => {
                                  setEditingUser(u);
                                  setShowEditUser(true);
                                }}
                                className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                                title="Edit user"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(u)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(`/admin/reset-password?email=${encodeURIComponent(u.email)}`, '_blank')}
                                className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-colors"
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
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(r.role as any)}`}>
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
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
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
              <button onClick={() => setShowAddUser(false)} className="text-white/50 hover:text-white text-xl leading-none">&times;</button>
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
                  <option value="employee">Employee</option>
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

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-white">Edit User</h3>
              <button onClick={() => setShowEditUser(false)} className="text-white/50 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <Label className="text-white/80 text-sm">Full Name</Label>
                <Input type="text" value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                  className="mt-1 bg-white/10 border-white/20 text-white" />
              </div>
              <div>
                <Label className="text-white/80 text-sm">Email</Label>
                <Input type="email" value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                  className="mt-1 bg-white/10 border-white/20 text-white" />
              </div>
              <div>
                <Label className="text-white/80 text-sm">Role</Label>
                <select value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="mt-1 w-full p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingUser.is_active === true || editingUser.is_active === 1}
                  onChange={e => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label className="text-white/80 text-sm">Active (can log in)</Label>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowEditUser(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={updatingUser}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
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