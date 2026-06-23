import React from 'react';
import { DatabaseZap, RefreshCcw, Info } from 'lucide-react';
import Link from 'next/link';

interface DatabaseErrorProps {
  message?: string;
  onRetry?: () => void;
}

const DatabaseError: React.FC<DatabaseErrorProps> = ({ 
  message = "We encountered an issue connecting to the database server. Please try again later.",
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg text-center max-w-md mx-auto my-12">
      <div className="bg-red-100 p-3 rounded-full mb-4">
        <DatabaseZap className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>

      <div className="text-left w-full mb-6 bg-white p-4 rounded border border-red-100">
        <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Info className="w-3 h-3" /> Troubleshooting
        </h3>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Ensure <strong>SQL Server ({process.env.NEXT_PUBLIC_DB_INSTANCE || 'SQLEXPRESS'})</strong> service is running.</li>
          <li>Check if <strong>TCP/IP</strong> is enabled in SQL Configuration Manager.</li>
          <li>Verify <code>NEXT_PUBLIC_DB_INSTANCE</code> matches your SQL instance in <code>.env.local</code>.</li>
        </ul>
      </div>

      <div className="flex gap-3">
        {onRetry && (
          <button onClick={onRetry} className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCcw className="w-4 h-4" />
            Retry
          </button>
        )}
        <Link href="/database-test" className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
          Run Diagnostics
        </Link>
      </div>
    </div>
  );
};

export default DatabaseError;