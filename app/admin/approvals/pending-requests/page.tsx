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
      ? 'bg-yellow-50 text-yellow-800 border border-yellow-250 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/50'
      : status === 'approved'
        ? 'bg-emerald-50 text-emerald-800 border border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
        : 'bg-red-50 text-red-800 border border-red-250 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-950 to-gray-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Pending Requests
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review registration approvals</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900/60 shadow-sm"
            onClick={() => fetchRequests(status)}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-1 w-fit">
          {tabs.map((t) => {
            const active = t.id === status;
            return (
              <button
                key={t.id}
                onClick={() => setStatus(t.id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  active ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow' : 'text-gray-655 hover:text-gray-905 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t.label}
                <span className={`ml-2 text-xs px-2.5 py-0.5 rounded-full border ${
                  active 
                    ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' 
                    : 'bg-slate-200/60 dark:bg-slate-800 border-slate-300/40 dark:border-slate-700 text-gray-600 dark:text-gray-400'
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
            className="bg-white dark:bg-gray-950 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {status === 'pending'
                    ? 'Pending Registration Requests'
                    : status === 'approved'
                      ? 'Approved Registrations'
                      : 'Rejected Registrations'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                  {status === 'pending'
                    ? 'Approve pending users to create real accounts.'
                    : 'Resolved registration requests.'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading...</div>
              ) : error ? (
                <div className="p-10 text-center text-red-600/80">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-10 text-center text-gray-400 dark:text-gray-600">No requests found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/40">
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
                          className="text-left p-4 text-gray-600 dark:text-gray-400 font-semibold tracking-wider uppercase text-xs whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">

                        <td className="p-4 text-gray-900 dark:text-white font-bold">{r.name}</td>

                        <td className="p-4 text-gray-655 dark:text-gray-300 font-medium">{r.email}</td>

                        <td className="p-4 text-gray-655 dark:text-gray-300 font-medium">{r.employeeId || '—'}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300">
                            {r.role}
                          </span>
                          {r.rejectionReason && r.status === 'rejected' ? (
                            <div className="mt-1 text-[11px] text-red-655 dark:text-red-400 font-semibold">
                              Reason: {r.rejectionReason}
                            </div>
                          ) : null}
                        </td>
                        <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(r.requestedAt)}</td>
                        <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(r.resolvedAt)}</td>
                        <td className="p-4">
                          <StatusPill status={r.status} />
                        </td>
                        {canApprove ? (
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => resolve(r.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm rounded-lg h-9 border-0"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => resolve(r.id, 'reject')}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm rounded-lg h-9 border-0"
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

