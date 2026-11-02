import { useState } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Seo from '@/components/common/Seo';
import { Card, Button, Input } from '@/components/ui';
import { useGetAuditLogsQuery } from '@/features/auth/authApi';

const ACTION_COLORS = {
  LOGIN_SUCCESS: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  LOGIN_FAILURE: 'bg-rose-100 text-rose-800 border-rose-200',
  ACCOUNT_LOCKED: 'bg-red-200 text-red-900 border-red-300 font-bold',
  LOGOUT: 'bg-gray-100 text-gray-800 border-gray-200',
  TOKEN_REFRESH_SUCCESS: 'bg-blue-100 text-blue-800 border-blue-200',
  TOKEN_REFRESH_REPLAY_DETECTED: 'bg-amber-200 text-amber-900 border-amber-300 font-bold',
  PASSWORD_CHANGED: 'bg-purple-100 text-purple-800 border-purple-200',
  PASSWORD_RESET: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  STAFF_CREATED: 'bg-teal-100 text-teal-800 border-teal-200',
  STAFF_UPDATED: 'bg-sky-100 text-sky-800 border-sky-200',
};

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const { data, isLoading, isFetching, refetch } = useGetAuditLogsQuery({
    page,
    limit: 25,
    ...(actionFilter ? { action: actionFilter } : {}),
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const filteredLogs = searchEmail.trim()
    ? logs.filter((l) =>
        l.actorEmail?.toLowerCase().includes(searchEmail.toLowerCase().trim()) ||
        l.ip?.includes(searchEmail.trim()) ||
        l.action?.toLowerCase().includes(searchEmail.toLowerCase().trim())
      )
    : logs;

  return (
    <>
      <Seo title="Audit Logs | Admin Console" noindex />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent/15 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Security Audit
            </div>
            <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-ink">
              System Audit Logs
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Immutable security events for authentication, lockouts, token rotations, and staff administration.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Logs
          </Button>
        </div>

        {/* Filter controls */}
        <Card className="p-4 border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
              <Input
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Search by email, IP address, or keyword..."
                className="pl-9 text-xs sm:text-sm"
              />
            </div>

            <div>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-border rounded-md text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">All Security Events</option>
                <option value="LOGIN_SUCCESS">Login Success</option>
                <option value="LOGIN_FAILURE">Login Failure</option>
                <option value="ACCOUNT_LOCKED">Account Locked</option>
                <option value="LOGOUT">Logout</option>
                <option value="TOKEN_REFRESH_SUCCESS">Token Refresh</option>
                <option value="TOKEN_REFRESH_REPLAY_DETECTED">Token Replay / Revocation</option>
                <option value="PASSWORD_CHANGED">Password Changed</option>
                <option value="PASSWORD_RESET">Password Reset</option>
                <option value="STAFF_CREATED">Staff Created</option>
                <option value="STAFF_UPDATED">Staff Updated</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Audit Log Table */}
        <Card className="overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-muted/10 border-b border-border text-muted uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Event Action</th>
                  <th className="py-3 px-4">Actor / Subject</th>
                  <th className="py-3 px-4">Client IP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-4 h-4 rounded-pill border-2 border-accent border-t-transparent animate-spin" />
                        <span>Loading audit logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted">
                      No audit events recorded matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const badgeClass =
                      ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800 border-gray-200';
                    const isFailure = log.status === 'FAILURE';

                    return (
                      <tr key={log._id || log.id} className="hover:bg-muted/5 transition-colors">
                        <td className="py-3 px-4 text-muted whitespace-nowrap text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-muted/70" />
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}
                          >
                            {log.action?.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium text-ink block">
                              {log.actorEmail || 'Anonymous'}
                            </span>
                            {log.actorRole && (
                              <span className="text-[10px] uppercase font-bold text-muted">
                                {log.actorRole}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-xs text-muted">
                          {log.ip || '—'}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isFailure
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {log.status || 'SUCCESS'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs text-muted max-w-xs truncate">
                          {log.details ? (
                            <span title={JSON.stringify(log.details)}>
                              {typeof log.details === 'string'
                                ? log.details
                                : Object.entries(log.details)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(', ')}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted">
              <span>
                Page {pagination.page} of {pagination.pages} ({pagination.total} total events)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
