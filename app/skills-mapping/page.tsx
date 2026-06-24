﻿"use client";

import React from "react";
import Link from "next/link";
import { useSkillMatrices } from "../../hooks/useSkillMatrices";
import { useDepartments } from "../../hooks/useDepartments";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Building, Clock } from "lucide-react";
import DatabaseLoading from "../components/DatabaseLoading";
import DatabaseError from "../components/DatabaseError";

console.log("=== NEXT.JS ENV DEBUG ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_INSTANCE:", process.env.DB_INSTANCE);
console.log("=========================");


export default function SkillsMapping() {
  const { matrices, loading: matricesLoading, error: matricesError } = useSkillMatrices();
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();

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
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Skills Mapping
            </h1>
            <p className="text-gray-600 mb-8">
              View and manage your organization's skills matrices
            </p>
            
            <div className="flex justify-center mb-6">
              <Link href="/skills_matrix_maker">
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Skills Matrix
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Skill Matrices</h3>
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{matrices.length}</p>
                <p className="text-gray-700 dark:text-gray-300">Total matrices available</p>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Departments</h3>
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{departments.length}</p>
                <p className="text-gray-700 dark:text-gray-300">Active departments</p>
              </div>
            </div>

            {matrices.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Skills Matrices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matrices.map((matrix) => {
                    // Extract employee and skill counts from matrixData
                    const employeeCount = matrix.matrixData?.employees?.length || 
                                        matrix.employeeCount || 
                                        ((matrix as any).employees ? (matrix as any).employees.length : 0);
                    const skillCount = matrix.matrixData?.skills?.length || 
                                     matrix.skillCount || 
                                     ((matrix as any).skills ? (matrix as any).skills.length : 0);
                    
                    // Find department name
                    const departmentName = departments.find(d => d._id === matrix.departmentId)?.name || 
                                         (matrix as any).department || 
                                         'Unknown Department';

                    return (
                      <div
                        key={matrix._id}
                        className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        onClick={() => window.open(`/skills_matrix_maker?matrixId=${matrix._id}`, '_blank')}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-bold text-gray-800 text-lg group-hover:text-orange-600 transition-colors">
                            {matrix.name}
                          </h3>
                          <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                            <FileText className="h-5 w-5" />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="h-4 w-4" />
                            <span>Department: {departmentName}</span>
                          </div>
                          
                          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                            <div className="text-center">
                              <div className="font-bold text-blue-600 text-xl">{employeeCount}</div>
                              <div className="text-xs text-gray-500">Employees</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600 text-xl">{skillCount}</div>
                              <div className="text-xs text-gray-500">Skills</div>
                            </div>
                          </div>
                          
                          {matrix.createdAt && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              Created: {new Date(matrix.createdAt).toLocaleDateString()}
                            </div>
                          )}
                          
                          {matrix.description && (
                            <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                              {matrix.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                          </div>
                          <button className="text-orange-600 hover:text-orange-800 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                            View Matrix →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {matrices.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-500 mb-4">No skills matrices found.</p>
                <p className="text-sm text-gray-400">
                  Create your first skills matrix using the Skills Matrix Maker.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}