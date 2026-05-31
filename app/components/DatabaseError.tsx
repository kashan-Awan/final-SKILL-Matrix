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
              <li>Make sure your SQL database server is running</li>
              <li>Check if your SQL database is accessible at the configured host/port</li>
              <li>Verify the database connection string in your <code className="bg-red-100 px-1 rounded">.env.local</code> file</li>
              <li>Try seeding the database first by visiting <code className="bg-red-100 px-1 rounded">/database-test</code></li>
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
