"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSkillMatrices } from "../../hooks/useSkillMatrices";
import { useDepartments } from "../../hooks/useDepartments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, FileText, Building, Clock, Users, Award, LayoutGrid, ArrowRight } from "lucide-react";
import DatabaseLoading from "../components/DatabaseLoading";
import DatabaseError from "../components/DatabaseError";


console.log("=== NEXT.JS ENV DEBUG ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_INSTANCE:", process.env.DB_INSTANCE);
console.log("=========================");


export default function SkillsMapping() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const { matrices, loading: matricesLoading, error: matricesError } = useSkillMatrices();
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();

  // Calculate unique operators monitored across all matrices
  const totalMonitoredOperators = useMemo(() => {
    if (!matrices) return 0;
    const uniqueIds = new Set<string>();
    matrices.forEach(m => {
      const emps = m.matrixData?.employees || [];
      emps.forEach((e: any) => {
        const id = e.id || e.employeeId || e.displayId;
        if (id) uniqueIds.add(id.toString());
      });
    });
    return uniqueIds.size;
  }, [matrices]);

  // Loading state
  if (matricesLoading || departmentsLoading) {
    return <DatabaseLoading />;
  }

  // Error state
  if (matricesError || departmentsError) {
    return <DatabaseError
      error={matricesError || departmentsError || ""}
      onRetry={() => window.location.reload()}
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-950 to-gray-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Skills Mapping &amp; Matrices
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualize competency mapping, track active line operator qualifications, and manage manufacturing matrices.
            </p>
          </div>
          <Link href="/skills_matrix_maker">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md flex items-center gap-2 px-4 py-2.5 h-auto text-sm border-0">
              <Plus className="h-4 w-4" />
              Create Skills Matrix
            </Button>
          </Link>
        </div>
        {/* Success Banner */}
        {isSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-800 text-emerald-850 dark:text-emerald-400 p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-sm font-bold flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">✓</span> Skills Matrix saved successfully!
            </span>
            <button
              onClick={() => router.replace("/skills-mapping")}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 font-extrabold text-xs uppercase tracking-wider transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Total Matrices
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {matrices.length}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Active competency models
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                <LayoutGrid className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm border-l-4 border-l-indigo-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Monitored Departments
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {departments.length}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Mapped facility segments
                </p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Building className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm border-l-4 border-l-emerald-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Tracked Operators
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalMonitoredOperators}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Unique operators evaluated
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Matrices List */}
        {matrices.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Available Skills Matrices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matrices.map((matrix, idx) => {
                const employeeCount = matrix.matrixData?.employees?.length ||
                  matrix.employeeCount ||
                  ((matrix as any).employees ? (matrix as any).employees.length : 0);
                const skillCount = matrix.matrixData?.skills?.length ||
                  matrix.skillCount ||
                  ((matrix as any).skills ? (matrix as any).skills.length : 0);
                const departmentName = departments.find(d => d.id === matrix.departmentId)?.name ||
                  (matrix as any).department ||
                  'Unknown Department';

                const borderColors = [
                  "border-t-4 border-t-blue-500 hover:border-blue-300 dark:hover:border-blue-800",
                  "border-t-4 border-t-indigo-500 hover:border-indigo-300 dark:hover:border-indigo-800",
                  "border-t-4 border-t-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-800",
                  "border-t-4 border-t-amber-500 hover:border-amber-300 dark:hover:border-amber-800",
                  "border-t-4 border-t-rose-500 hover:border-rose-300 dark:hover:border-rose-800",
                  "border-t-4 border-t-violet-500 hover:border-violet-300 dark:hover:border-violet-800"
                ];
                
                const iconColors = [
                  "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
                  "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
                  "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
                  "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
                  "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
                  "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"
                ];
                
                const tagColors = [
                  "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30",
                  "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-900/30",
                  "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30",
                  "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30",
                  "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30",
                  "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-300 dark:border-violet-900/30"
                ];

                const viewTextColors = [
                  "text-blue-600 dark:text-blue-400",
                  "text-indigo-600 dark:text-indigo-400",
                  "text-emerald-600 dark:text-emerald-400",
                  "text-amber-600 dark:text-amber-400",
                  "text-rose-600 dark:text-rose-400",
                  "text-violet-600 dark:text-violet-400"
                ];

                return (
                  <Card
                    key={matrix.id}
                    className={`border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group overflow-hidden ${borderColors[idx % borderColors.length]}`}
                    onClick={() => router.push(`/skills_matrix_maker?matrixId=${matrix.id}`)}
                  >
                    <CardHeader className="pb-3 border-b border-gray-50 dark:border-gray-800/60">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <CardTitle className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {matrix.name}
                          </CardTitle>
                          <Badge variant="outline" className={`mt-1.5 w-fit ${tagColors[idx % tagColors.length]} text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider`}>
                            {departmentName}
                          </Badge>
                        </div>
                        <div className={`p-2 rounded-xl flex-shrink-0 ${iconColors[idx % iconColors.length]}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 flex-1 flex flex-col justify-between gap-4">
                      {/* Metric capsules */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-gray-800/40 text-center">
                          <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                            {employeeCount}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                            Operators
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-gray-800/40 text-center">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                            {skillCount}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                            Skills Mapped
                          </div>
                        </div>
                      </div>

                      {matrix.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 italic bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                          {matrix.description}
                        </p>
                      )}

                      <div className="flex justify-between items-center text-xs mt-2 pt-3 border-t border-gray-50 dark:border-gray-800/40">
                        {matrix.createdAt ? (
                          <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                            <Clock className="h-3 w-3" />
                            <span>Updated {new Date(matrix.createdAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <div />
                        )}
                        <span className={`font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform ${viewTextColors[idx % viewTextColors.length]}`}>
                          View Matrix <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white/50 dark:bg-gray-900/50 max-w-2xl mx-auto mt-8">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Skills Matrices Mapped
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              Skills matrices help you track and visualize department-wide employee skills. Create your first matrix to get started.
            </p>
            <Link href="/skills_matrix_maker">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Create First Matrix
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}