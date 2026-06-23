"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Database } from "lucide-react"

interface DatabaseErrorProps {
  error: string;
  onRetry: () => void;
}

export default function DatabaseError({ error, onRetry }: DatabaseErrorProps) {
  return (
    <div className="container mx-auto py-8">
      <Card className="bg-red-50 border-red-200 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-6 w-6" />
            Database Connection Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-red-700">
            <p className="font-medium mb-2">Unable to connect to the database:</p>
            <p className="bg-red-100 p-3 rounded-lg text-sm font-mono">{error}</p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-red-800">Troubleshooting Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-red-700">
              <li>Open **Services.msc** and ensure **SQL Server (SQLEXPRESS)** and **SQL Server Browser** are "Running".</li>
              <li>In **SQL Server Configuration Manager**, enable **TCP/IP** and ensure **Port 1433** is set in IPAll (if not using a named instance).</li>
              <li>If using a Named Instance (e.g. SQLEXPRESS), ensure <code className="bg-red-100 px-1 rounded">DB_INSTANCE</code> is set in <code className="bg-red-100 px-1 rounded">.env.local</code> and <code className="bg-red-100 px-1 rounded">DB_PORT</code> is **removed**.</li>
              <li>Ensure your SQL Server allows **Mixed Mode Authentication** (SQL Server and Windows Auth).</li>
              <li>
                Current Connection Settings:
                <ul className="list-disc list-inside ml-6 text-xs mt-1">
                  <li>Host: {process.env.NEXT_PUBLIC_DB_HOST || 'localhost'}</li>
                  <li>Port: {process.env.NEXT_PUBLIC_DB_INSTANCE ? 'SQL Browser (dynamic)' : (process.env.NEXT_PUBLIC_DB_PORT || '1433')}</li>
                  <li>Instance: {process.env.NEXT_PUBLIC_DB_INSTANCE || 'None'} (Ensure this matches your SQL Server instance name if applicable)</li>
                  <li>Database: {process.env.NEXT_PUBLIC_DB_NAME || 'Dawlance_Skills_Matrix'}</li>
                </ul>
              </li>
              <li>Try seeding the database first by visiting <a href="/database-test" className="underline font-medium">/database-test</a></li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </Button>
            <Button 
              variant="outline" 
              asChild
              className="flex items-center gap-2"
            >
              <a href="/database-test">
                <Database className="h-4 w-4" />
                Test Database
              </a>
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Quick Start:</h4>
            <p className="text-sm text-blue-700">
              If this is your first time, visit the <a href="/database-test" className="underline font-medium">Database Test page</a> to 
              seed your SQL database with sample fridge manufacturing data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
