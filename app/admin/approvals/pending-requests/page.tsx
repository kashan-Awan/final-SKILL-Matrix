"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

type RegistrationStatus = 'pending' | 'approved' | 'rejected';

type PendingRegistrationRequest = {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  role: string;
  status: RegistrationStatus;
  rejectionReason: string | null;
  requestedAt: string;
  resolvedAt: string | null;
};

type ApiResponse = {
  success: boolean;
  requests: PendingRegistrationRequest[];
  counts: { pending: number; approved: number; rejected: number };
  message: string;
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function StatusPill({ status }: { status: RegistrationStatus }) {
  const cls =
    status === 'pending'
      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40'
      : status === 'approved'
        ? 'bg-green-500/20 text-green-300 border-green-400/40'
        : 'bg-red-500/20 text-red-300 border-red-400/40';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function PendingRequestsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<RegistrationStatus>('pending');
  const [requests, setRequests] = useState<PendingRegistrationRequest[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async (nextStatus: RegistrationStatus) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const qs = nextStatus ? `?status=${encodeURIComponent(nextStatus)}` : '';
      const res = await fetch(`http://localhost:5001/api/auth/registrations${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as any;

      // DEBUG: inspect raw response shape
      console.log('[pending-requests] raw response keys:', Object.keys(data || {}));

      if (!data?.success) {
        setError(data?.message || 'Failed to load requests');
        setRequests([]);
        return;
      }

      // Some backends return { success, data: { requests, counts } }
      const requestsFromApi = data.requests ?? data?.data?.requests ?? [];
      const countsFromApi = data.counts ?? data?.data?.counts ?? { pending: 0, approved: 0, rejected: 0 };

      console.log('[pending-requests] requestsFromApi.length:', (requestsFromApi || []).length);
      console.log('[pending-requests] requestsFromApi[0]:', (requestsFromApi || [])[0]);

      setRequests(requestsFromApi || []);
      setCounts(countsFromApi || { pending: 0, approved: 0, rejected: 0 });
    } catch {
      setError('Failed to load requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRequests(status);
  }, [status, fetchRequests]);

  const canApprove = status === 'pending';

  const resolve = async (requestId: string, action: 'approve' | 'reject') => {
    const token = localStorage.getItem('token');


    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5001/api/auth/registrations/${encodeURIComponent(requestId)}/${action === 'approve' ? 'approve' : 'reject'}`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!data?.success) {
        setError(data?.message || 'Approval failed');
        return;
      }

      // refresh current and also counts
      await fetchRequests('pending');
      setStatus('pending');
    } catch {
      setError('Approval failed');
    }
  };

  const tabs = useMemo(
    () =>
      [
        { id: 'pending' as const, label: 'Pending', count: counts.pending },
        { id: 'approved' as const, label: 'Approved', count: counts.approved },
        { id: 'rejected' as const, label: 'Rejected', count: counts.rejected },
      ] as const,
    [counts]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-6"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">Pending Requests</h1>
              <p className="text-white/50 text-sm">Review registration approvals</p>
            </div>
          </div>

          <Button
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/15"
            onClick={() => fetchRequests(status)}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        <div className="flex space-x-2 mb-5 bg-white/5 rounded-xl p-1 w-fit">
          {tabs.map((t) => {
            const active = t.id === status;
            return (
              <button
                key={t.id}
                onClick={() => setStatus(t.id)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-white text-blue-900 shadow' : 'text-white/70 hover:text-white'
                }`}
              >
                {t.label}
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${
                  active ? 'bg-blue-900/10 border-blue-900/20 text-blue-900' : 'bg-white/5 border-white/10 text-white/80'
                }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
          >
            <div className="p-5 border-b border-white/20 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {status === 'pending'
                    ? 'Pending Registration Requests'
                    : status === 'approved'
                      ? 'Approved Registrations'
                      : 'Rejected Registrations'}
                </h2>
                <p className="text-white/50 text-xs mt-0.5">
                  {status === 'pending'
                    ? 'Approve pending users to create real accounts.'
                    : 'Resolved registration requests.'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-white/50">Loading...</div>
              ) : error ? (
                <div className="p-10 text-center text-red-200/80">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-10 text-center text-white/40">No requests found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      {[
                        'Name',
                        'Email',
                        'Employee ID',
                        'Role',
                        'Requested At',
                        'Resolved At',
                        'Status',
                        ...(canApprove ? ['Actions'] : []),
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left p-4 text-white/70 font-medium whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">

                        <td className="p-4 text-white font-medium">{r.name}</td>

                        <td className="p-4 text-white/70">{r.email}</td>

                        <td className="p-4 text-white/70">{r.employeeId || '—'}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-white/15 bg-white/5 text-white/80">
                            {r.role}
                          </span>
                          {r.rejectionReason && r.status === 'rejected' ? (
                            <div className="mt-1 text-[11px] text-red-200/80">
                              Reason: {r.rejectionReason}
                            </div>
                          ) : null}
                        </td>
                        <td className="p-4 text-white/60 whitespace-nowrap">{formatDate(r.requestedAt)}</td>
                        <td className="p-4 text-white/60 whitespace-nowrap">{formatDate(r.resolvedAt)}</td>
                        <td className="p-4">
                          <StatusPill status={r.status} />
                        </td>
{canApprove ? (
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => resolve(r.id, 'approve')}

                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => resolve(r.id, 'reject')}

                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </td>
                        ) : null}

                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </AnimatePresence>


      </div>
    </div>
  );
}

