import React from 'react';
import {
  Users,
  Calendar,
  User,
  ChevronRight,
  Eye,
  Edit3
} from 'lucide-react';
export interface SkillsMatrix {
  id: string;
  name: string;
  description?: string;
  departmentId?: string;
  department?: string;
  skills?: string[];
  employees?: { name: string; displayId: string; skills: Record<string, string> }[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  lastModified?: string;
  isActive?: boolean;
  matrixData?: any;
  color?: string;
}

interface SkillsMatrixCardProps {
  matrix: SkillsMatrix;
  onClick: () => void;
  isSelected?: boolean;
}

const SkillsMatrixCard: React.FC<SkillsMatrixCardProps> = ({
  matrix,
  onClick,
  isSelected = false,
}) => {

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 
        transform hover:scale-105 hover:shadow-2xl group
        ${isSelected ? 'ring-4 ring-orange-500 shadow-2xl scale-105' : 'shadow-lg hover:shadow-xl'}
      `}
    >
      {/* Background gradient */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br ${matrix.color || 'from-gray-200 to-gray-300'} opacity-10 
          group-hover:opacity-20 transition-opacity duration-300
        `}
      />

      {/* Main card content */}
      <div className="relative bg-white p-8 border-2 border-gray-100 group-hover:border-orange-200 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
              {matrix.name || 'Untitled Matrix'}
            </h3>
            <p className="text-lg text-gray-600 line-clamp-2">
              {matrix.description || 'No description provided'}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div
              className={`
                w-16 h-16 rounded-xl bg-gradient-to-br ${matrix.color || 'from-gray-300 to-gray-400'} 
                flex items-center justify-center text-white font-bold text-xl
                shadow-lg group-hover:shadow-xl transition-shadow duration-300
              `}
            >
              {(matrix.department || 'NA').substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Employees</p>
              <p className="text-xl font-bold text-gray-900">
                {matrix?.employees?.length ?? 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Edit3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Skills</p>
              <p className="text-xl font-bold text-gray-900">
                {matrix?.skills?.length ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Created: {matrix.createdAt || 'Unknown date'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>By: {matrix.createdBy || 'Unknown'}</span>
          </div>
        </div>

        {/* Action indicator */}
        <div className="flex items-center justify-between">
          <span
            className={`
              inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold
              bg-gradient-to-r ${matrix.color || 'from-gray-400 to-gray-500'} text-white
            `}
          >
            {matrix.department || 'No Department'}
          </span>

          <div className="flex items-center gap-2 text-orange-600 font-semibold">
            <span className="text-sm">View Matrix</span>
            <ChevronRight
              className={`
                h-5 w-5 transition-transform duration-300 
                ${isSelected ? 'transform rotate-90' : 'group-hover:translate-x-1'}
              `}
            />
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default SkillsMatrixCard;
