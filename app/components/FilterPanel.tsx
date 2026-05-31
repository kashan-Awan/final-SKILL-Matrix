import React from 'react';
import { Filter, X, Search, Building2, Table2 } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  color?: string;
}

interface FilterPanelProps {
  selectedDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
  showMatricesOnly: boolean;
  onToggleMatricesOnly: () => void;
  departments: Department[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedDepartment,
  onDepartmentChange,
  searchTerm,
  onSearchChange,
  onClearFilters,
  showMatricesOnly,
  onToggleMatricesOnly,
  departments
}) => {
  const hasActiveFilters = selectedDepartment || searchTerm || showMatricesOnly;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Filter className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
            <p className="text-lg text-gray-600">Refine your matrix search</p>
          </div>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* Search */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-gray-700">
            Search Matrices
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, description, or skills..."
              className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-200"
            />
          </div>
        </div>

        {/* View Toggle */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-gray-700">
            View Options
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleMatricesOnly}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-semibold text-lg transition-all duration-200
                ${showMatricesOnly 
                  ? 'bg-orange-50 border-orange-200 text-orange-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Table2 className="h-5 w-5" />
              Skills Matrices Only
              {showMatricesOnly && (
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Department Filter */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-gray-700">
            Department
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {departments.map((dept: Department) => (
              <button
                key={dept.id}
                onClick={() => onDepartmentChange(dept.id === selectedDepartment ? '' : dept.id)}
                className={`
                  flex items-center gap-3 p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200
                  ${selectedDepartment === dept.id
                    ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-lg'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg bg-gradient-to-br ${dept.color} 
                  flex items-center justify-center text-white font-bold text-sm
                `}>
                  {dept.name.substring(0, 2)}
                </div>
                <span>{dept.name}</span>
                {selectedDepartment === dept.id && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;