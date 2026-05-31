// Centralized role color utility for consistent UI
export function getRoleColor(role: string, isDark = false) {
  switch (role) {
    case 'admin':
      return isDark
        ? 'bg-red-900/30 text-red-300 border-red-700'
        : 'bg-red-100 text-red-800 border-red-200';
    case 'manager':
      return isDark
        ? 'bg-blue-900/30 text-blue-300 border-blue-700'
        : 'bg-blue-100 text-blue-800 border-blue-200';
    case 'user':
      return isDark
        ? 'bg-green-900/30 text-green-300 border-green-700'
        : 'bg-green-100 text-green-800 border-green-200';
    default:
      return isDark
        ? 'bg-gray-900/30 text-gray-300 border-gray-700'
        : 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
