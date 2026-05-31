// "use client";

// import { useState, useEffect } from "react";

// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Building2,
//   Users,
//   User,
//   Wrench,
//   Filter,
//   ToggleLeft,
//   ToggleRight,
//   AlertTriangle,
//   CheckCircle,
//   Star,
//   Info,
// } from "lucide-react";

// import Select from "../components/Select";
// import Button from "../components/Button";
// import EmployeeMatchCard from "../components/EmployeeMatchCard";
// import { staffingMachines, staffingEmployees } from "../data/staffingData";
// import type { StaffingMachine, StaffingEmployee } from "../types/staffing";
// import { useTheme } from "../components/ThemeProvider";
// import { enhancedDepartments } from "../data/enhancedMockData";
// import MachineTagBadge from "../components/MachineTagBadge";

// export default function StaffingAssignmentPage() {
//   const [selectedDepartment, setSelectedDepartment] = useState<string>("");
//   const [selectedDepartmentName, setSelectedDepartmentName] =
//     useState<string>("");
//   const [availableMachines, setAvailableMachines] = useState<StaffingMachine[]>(
//     []
//   );
//   const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
//   const [matchingEmployees, setMatchingEmployees] = useState<
//     StaffingEmployee[]
//   >([]);
//   const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
//   const [viewMode, setViewMode] = useState<"machines" | "employees">(
//     "machines"
//   );
//   const [filterCritical, setFilterCritical] = useState<boolean>(false);
//   const [filterFemaleEligible, setFilterFemaleEligible] =
//     useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const { isDark } = useTheme();

//   // Load machines when department changes
//   useEffect(() => {
//     if (selectedDepartment) {
//       setIsLoading(true);
//       const department = enhancedDepartments.find(
//         (dept) => dept.id === selectedDepartment
//       );
//       setSelectedDepartmentName(department?.name || "");

//       setTimeout(() => {
//         const machines = staffingMachines.filter(
//           (machine) => machine.departmentId === selectedDepartment
//         );
//         setAvailableMachines(machines);
//         setSelectedMachines([]);
//         setMatchingEmployees([]);
//         setSelectedEmployees([]);
//         setIsLoading(false);
//       }, 500);
//     } else {
//       setAvailableMachines([]);
//       setSelectedMachines([]);
//       setMatchingEmployees([]);
//       setSelectedEmployees([]);
//     }
//   }, [selectedDepartment]);

//   // Find matching employees when machines are selected
//   useEffect(() => {
//     if (selectedMachines.length > 0) {
//       const machines = availableMachines.filter((m) =>
//         selectedMachines.includes(m.id)
//       );
//       const allRequiredSkills = Array.from(
//         new Set(machines.flatMap((m) => m.requiredSkills))
//       );

//       const employees = staffingEmployees.filter((emp) => {
//         // Check if employee is in the same department
//         if (emp.departmentId !== selectedDepartment) return false;

//         // Check if employee has at least one required skill
//         return allRequiredSkills.some((skill) => {
//           const empSkill = emp.skills[skill];
//           return empSkill && empSkill !== "None";
//         });
//       });

//       // Sort by skill match percentage
//       const sortedEmployees = employees.sort((a, b) => {
//         const aMatch = allRequiredSkills.filter(
//           (skill) => a.skills[skill] && a.skills[skill] !== "None"
//         ).length;
//         const bMatch = allRequiredSkills.filter(
//           (skill) => b.skills[skill] && b.skills[skill] !== "None"
//         ).length;
//         return bMatch - aMatch;
//       });

//       setMatchingEmployees(sortedEmployees);
//     } else {
//       setMatchingEmployees([]);
//       setSelectedEmployees([]);
//     }
//   }, [selectedMachines, availableMachines, selectedDepartment]);

//   const handleMachineToggle = (machineId: string) => {
//     setSelectedMachines((prev) =>
//       prev.includes(machineId)
//         ? prev.filter((id) => id !== machineId)
//         : [...prev, machineId]
//     );
//   };

//   const handleEmployeeToggle = (employeeId: string) => {
//     setSelectedEmployees((prev) =>
//       prev.includes(employeeId)
//         ? prev.filter((id) => id !== employeeId)
//         : [...prev, employeeId]
//     );
//   };

//   const getFilteredMachines = () => {
//     let filtered = availableMachines;

//     if (filterCritical) {
//       filtered = filtered.filter((m) => m.isCritical);
//     }

//     if (filterFemaleEligible) {
//       filtered = filtered.filter((m) => m.femaleEligible);
//     }

//     return filtered;
//   };

//   const getAllRequiredSkills = () => {
//     const machines = availableMachines.filter((m) =>
//       selectedMachines.includes(m.id)
//     );
//     return Array.from(new Set(machines.flatMap((m) => m.requiredSkills)));
//   };

//   const departmentOptions = enhancedDepartments.map((dept) => ({
//     value: dept.id,
//     label: dept.name,
//   }));

//   const filteredMachines = getFilteredMachines();
//   const allRequiredSkills = getAllRequiredSkills();

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//           Staffing Assignment
//         </h1>
//         <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
//           Assign workers to machines based on skills and availability
//         </p>
//       </motion.div>

//       {/* Department Selection */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1, duration: 0.5 }}
//         className="max-w-md"
//       >
//         <Select
//           label="Select Department"
//           value={selectedDepartment}
//           onChange={setSelectedDepartment}
//           options={departmentOptions}
//           placeholder="Choose a department..."
//         />
//       </motion.div>

//       {selectedDepartment && (
//         <>
//           {/* Department Stats */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//             className="grid grid-cols-1 md:grid-cols-4 gap-4"
//           >
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
//               <div className="flex items-center gap-3">
//                 <Building2 className="h-6 w-6" />
//                 <div>
//                   <h3 className="font-semibold">{selectedDepartmentName}</h3>
//                   <p className="text-blue-100 text-sm">Department</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 text-white">
//               <div className="flex items-center gap-3">
//                 <Wrench className="h-6 w-6" />
//                 <div>
//                   <h3 className="text-xl font-bold">
//                     {availableMachines.length}
//                   </h3>
//                   <p className="text-purple-100 text-sm">Total Machines</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
//               <div className="flex items-center gap-3">
//                 <Users className="h-6 w-6" />
//                 <div>
//                   <h3 className="text-xl font-bold">
//                     {selectedMachines.length}
//                   </h3>
//                   <p className="text-green-100 text-sm">Selected Machines</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-4 text-white">
//               <div className="flex items-center gap-3">
//                 <Star className="h-6 w-6" />
//                 <div>
//                   <h3 className="text-xl font-bold">
//                     {matchingEmployees.length}
//                   </h3>
//                   <p className="text-orange-100 text-sm">Available Workers</p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {/* Controls */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//             className="flex flex-wrap gap-4 items-center justify-between"
//           >
//             <div className="flex gap-2 items-center">
//               <Button
//                 onClick={() => setViewMode("machines")}
//                 variant={viewMode === "machines" ? "primary" : "outline"}
//                 size="sm"
//                 className="flex items-center gap-2"
//               >
//                 <Wrench className="h-4 w-4" />
//                 Machines
//               </Button>
//               <Button
//                 onClick={() => setViewMode("employees")}
//                 variant={viewMode === "employees" ? "primary" : "outline"}
//                 size="sm"
//                 className="flex items-center gap-2"
//                 disabled={selectedMachines.length === 0}
//               >
//                 <Users className="h-4 w-4" />
//                 Workers ({matchingEmployees.length})
//               </Button>
//             </div>

//             {viewMode === "machines" && (
//               <div className="flex gap-4 items-center">
//                 <button
//                   onClick={() => setFilterCritical(!filterCritical)}
//                   className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
//                     filterCritical
//                       ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
//                       : isDark
//                       ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   {filterCritical ? (
//                     <ToggleRight className="h-4 w-4" />
//                   ) : (
//                     <ToggleLeft className="h-4 w-4" />
//                   )}
//                   <AlertTriangle className="h-4 w-4" />
//                   <span className="text-sm">Critical Only</span>
//                 </button>

//                 <button
//                   onClick={() => setFilterFemaleEligible(!filterFemaleEligible)}
//                   className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
//                     filterFemaleEligible
//                       ? "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400"
//                       : isDark
//                       ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   {filterFemaleEligible ? (
//                     <ToggleRight className="h-4 w-4" />
//                   ) : (
//                     <ToggleLeft className="h-4 w-4" />
//                   )}
//                   <span className="text-sm">♀</span>
//                   <span className="text-sm">Female Eligible</span>
//                 </button>
//               </div>
//             )}
//           </motion.div>

//           {/* Legend */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4, duration: 0.5 }}
//             className={`p-4 rounded-xl border ${
//               isDark
//                 ? "bg-gray-800/50 border-gray-700"
//                 : "bg-blue-50 border-blue-200"
//             }`}
//           >
//             <div className="flex items-center gap-3 mb-3">
//               <Info className="h-5 w-5 text-blue-600" />
//               <h3
//                 className={`font-semibold ${
//                   isDark ? "text-white" : "text-gray-900"
//                 }`}
//               >
//                 Legend
//               </h3>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
//                   <AlertTriangle className="h-2 w-2 text-white" />
//                 </div>
//                 <span className={isDark ? "text-gray-300" : "text-gray-700"}>
//                   Critical Station
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
//                   <span className="text-white text-xs">♀</span>
//                 </div>
//                 <span className={isDark ? "text-gray-300" : "text-gray-700"}>
//                   Female Eligible
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
//                   <span className="text-white text-xs">♂</span>
//                 </div>
//                 <span className={isDark ? "text-gray-300" : "text-gray-700"}>
//                   Male Worker
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
//                   <Star className="h-2 w-2 text-white" />
//                 </div>
//                 <span className={isDark ? "text-gray-300" : "text-gray-700"}>
//                   Highly Skilled
//                 </span>
//               </div>
//             </div>
//           </motion.div>

//           {/* Content */}
//           <AnimatePresence mode="wait">
//             {viewMode === "machines" ? (
//               <motion.div
//                 key="machines"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: 20 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h3
//                       className={`text-lg font-semibold ${
//                         isDark ? "text-white" : "text-gray-900"
//                       }`}
//                     >
//                       Available Machines ({filteredMachines.length})
//                     </h3>
//                     {selectedMachines.length > 0 && (
//                       <Button
//                         onClick={() => setSelectedMachines([])}
//                         variant="outline"
//                         size="sm"
//                         className="text-red-600 border-red-300 hover:bg-red-50"
//                       >
//                         Clear Selection
//                       </Button>
//                     )}
//                   </div>

//                   {isLoading ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {[...Array(6)].map((_, i) => (
//                         <div
//                           key={i}
//                           className={`h-48 rounded-xl animate-pulse ${
//                             isDark ? "bg-gray-700" : "bg-gray-200"
//                           }`}
//                         />
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {filteredMachines.map((machine, index) => (
//                         <motion.div
//                           key={machine.id}
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: index * 0.1, duration: 0.3 }}
//                           whileHover={{ scale: 1.02, y: -2 }}
//                           whileTap={{ scale: 0.98 }}
//                           onClick={() => handleMachineToggle(machine.id)}
//                           className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
//                             selectedMachines.includes(machine.id)
//                               ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg"
//                               : isDark
//                               ? "border-gray-600 bg-gray-700/50 hover:bg-gray-700"
//                               : "border-gray-200 bg-white hover:bg-gray-50"
//                           }`}
//                         >
//                           {/* Machine Header */}
//                           <div className="flex items-start justify-between mb-3">
//                             <div className="flex-1">
//                               <h3
//                                 className={`font-semibold text-sm ${
//                                   isDark ? "text-white" : "text-gray-900"
//                                 }`}
//                               >
//                                 {machine.name}
//                               </h3>
//                               <p
//                                 className={`text-xs ${
//                                   isDark ? "text-gray-400" : "text-gray-600"
//                                 }`}
//                               >
//                                 ID: {machine.id}
//                               </p>
//                             </div>

//                             {selectedMachines.includes(machine.id) && (
//                               <motion.div
//                                 initial={{ scale: 0 }}
//                                 animate={{ scale: 1 }}
//                                 className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
//                               >
//                                 <CheckCircle className="h-4 w-4 text-white" />
//                               </motion.div>
//                             )}
//                           </div>

//                           {/* Machine Tags */}
//                           <div className="mb-3">
//                             <MachineTagBadge
//                               isCritical={machine.isCritical}
//                               femaleEligible={machine.femaleEligible}
//                               size="sm"
//                             />
//                           </div>

//                           {/* Worker Status */}
//                           {/* <div className="flex items-center gap-2 mb-3">
//                               {machine.currentWorkers === 0 ? (
//                                 <AlertTriangle className="h-4 w-4 text-red-600" />
//                               ) : machine.currentWorkers < machine.maxWorkers ? (
//                                 <Users className="h-4 w-4 text-yellow-600" />
//                               ) : (
//                                 <CheckCircle className="h-4 w-4 text-green-600" />
//                               )}
//                               <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
//                                 {machine.currentWorkers}/{machine.maxWorkers} Workers
//                               </span>
//                             </div> */}

//                           {/* Required Skills */}
//                           <div className="space-y-1">
//                             <p
//                               className={`text-xs font-medium ${
//                                 isDark ? "text-gray-400" : "text-gray-600"
//                               }`}
//                             >
//                               Required Skills:
//                             </p>
//                             <div className="flex flex-wrap gap-1">
//                               {machine.requiredSkills.map((skill) => (
//                                 <span
//                                   key={skill}
//                                   className={`px-2 py-1 rounded-md text-xs font-medium ${
//                                     isDark
//                                       ? "bg-blue-900 text-blue-100"
//                                       : "bg-blue-100 text-blue-800"
//                                   }`}
//                                 >
//                                   {skill}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>
//                         </motion.div>
//                       ))}
//                     </div>
//                   )}

//                   {filteredMachines.length === 0 && !isLoading && (
//                     <div className="text-center py-12">
//                       <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                       <p
//                         className={`text-lg font-medium ${
//                           isDark ? "text-gray-300" : "text-gray-600"
//                         }`}
//                       >
//                         No machines found
//                       </p>
//                       <p
//                         className={`text-sm ${
//                           isDark ? "text-gray-400" : "text-gray-500"
//                         }`}
//                       >
//                         Try adjusting your filters or select a different
//                         department
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="employees"
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h3
//                       className={`text-lg font-semibold ${
//                         isDark ? "text-white" : "text-gray-900"
//                       }`}
//                     >
//                       Available Workers ({matchingEmployees.length})
//                     </h3>
//                     {selectedEmployees.length > 0 && (
//                       <Button
//                         onClick={() => setSelectedEmployees([])}
//                         variant="outline"
//                         size="sm"
//                         className="text-red-600 border-red-300 hover:bg-red-50"
//                       >
//                         Clear Selection
//                       </Button>
//                     )}
//                   </div>

//                   {selectedMachines.length > 0 && (
//                     <div className="space-y-4">
//                       {/* Skills breakdown per machine */}
//                       <div
//                         className={`p-4 rounded-lg ${
//                           isDark ? "bg-gray-700/50" : "bg-gray-50"
//                         }`}
//                       >
//                         <h4
//                           className={`text-lg font-semibold mb-3 ${
//                             isDark ? "text-white" : "text-gray-900"
//                           }`}
//                         >
//                           Skills Required by Selected Machines
//                         </h4>
//                         <div className="space-y-3">
//                           {availableMachines
//                             .filter((m) => selectedMachines.includes(m.id))
//                             .map((machine) => (
//                               <div
//                                 key={machine.id}
//                                 className={`p-3 rounded-lg border ${
//                                   isDark
//                                     ? "bg-gray-800 border-gray-600"
//                                     : "bg-white border-gray-200"
//                                 }`}
//                               >
//                                 <div className="flex items-center justify-between mb-2">
//                                   <h5
//                                     className={`font-medium ${
//                                       isDark ? "text-white" : "text-gray-900"
//                                     }`}
//                                   >
//                                     {machine.name}
//                                   </h5>
//                                   <MachineTagBadge
//                                     isCritical={machine.isCritical}
//                                     femaleEligible={machine.femaleEligible}
//                                     size="sm"
//                                   />
//                                 </div>
//                                 <div className="flex flex-wrap gap-2">
//                                   {machine.requiredSkills.map((skill) => (
//                                     <span
//                                       key={skill}
//                                       className={`px-2 py-1 rounded-md text-xs font-medium ${
//                                         isDark
//                                           ? "bg-blue-600 text-white"
//                                           : "bg-blue-100 text-blue-800"
//                                       }`}
//                                     >
//                                       {skill}
//                                     </span>
//                                   ))}
//                                 </div>
//                               </div>
//                             ))}
//                         </div>
//                       </div>

//                       {/* All unique skills summary */}
//                       <div
//                         className={`p-4 rounded-lg ${
//                           isDark ? "bg-blue-900/20" : "bg-blue-50"
//                         }`}
//                       >
//                         <p
//                           className={`text-sm font-medium mb-2 ${
//                             isDark ? "text-blue-300" : "text-blue-700"
//                           }`}
//                         >
//                           All Required Skills ({allRequiredSkills.length}):
//                         </p>
//                         <div className="flex flex-wrap gap-2">
//                           {allRequiredSkills.map((skill) => (
//                             <span
//                               key={skill}
//                               className={`px-3 py-1 rounded-full text-sm font-medium ${
//                                 isDark
//                                   ? "bg-blue-600 text-white"
//                                   : "bg-blue-200 text-blue-800"
//                               }`}
//                             >
//                               {skill}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Employee Cards */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {matchingEmployees.map((employee, index) => (
//                       <EmployeeMatchCard
//                         key={employee.id}
//                         employee={employee}
//                         requiredSkills={allRequiredSkills}
//                         isSelected={selectedEmployees.includes(employee.id)}
//                         onClick={() => handleEmployeeToggle(employee.id)}
//                         index={index}
//                       />
//                     ))}
//                   </div>

//                   {/* Detailed Skills Mapping Table */}
//                   {matchingEmployees.length > 0 && (
//                     <div className="mt-8">
//                       <h4
//                         className={`text-lg font-semibold mb-4 ${
//                           isDark ? "text-white" : "text-gray-900"
//                         }`}
//                       >
//                         Employee Skills Mapping
//                       </h4>
//                       <div
//                         className={`rounded-lg border overflow-hidden ${
//                           isDark
//                             ? "border-gray-600 bg-gray-800"
//                             : "border-gray-200 bg-white"
//                         }`}
//                       >
//                         <div className="overflow-x-auto">
//                           <table className="w-full">
//                             <thead
//                               className={isDark ? "bg-gray-700" : "bg-gray-50"}
//                             >
//                               <tr>
//                                 <th
//                                   className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
//                                     isDark ? "text-gray-300" : "text-gray-500"
//                                   }`}
//                                 >
//                                   Employee
//                                 </th>
//                                 <th
//                                   className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
//                                     isDark ? "text-gray-300" : "text-gray-500"
//                                   }`}
//                                 >
//                                   Match %
//                                 </th>
//                                 {allRequiredSkills.map((skill) => (
//                                   <th
//                                     key={skill}
//                                     className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider ${
//                                       isDark ? "text-gray-300" : "text-gray-500"
//                                     }`}
//                                   >
//                                     {skill}
//                                   </th>
//                                 ))}
//                                 <th
//                                   className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
//                                     isDark ? "text-gray-300" : "text-gray-500"
//                                   }`}
//                                 >
//                                   Action
//                                 </th>
//                               </tr>
//                             </thead>
//                             <tbody
//                               className={`divide-y ${
//                                 isDark ? "divide-gray-600" : "divide-gray-200"
//                               }`}
//                             >
//                               {matchingEmployees.map((employee) => {
//                                 const matchedSkills = allRequiredSkills.filter(
//                                   (skill) => {
//                                     const empSkill = employee.skills[skill];
//                                     return empSkill && empSkill !== "None";
//                                   }
//                                 );
//                                 const matchPercentage = Math.round(
//                                   (matchedSkills.length /
//                                     allRequiredSkills.length) *
//                                     100
//                                 );
//                                 const isSelected = selectedEmployees.includes(
//                                   employee.id
//                                 );

//                                 return (
//                                   <tr
//                                     key={employee.id}
//                                     className={`transition-colors ${
//                                       isSelected
//                                         ? isDark
//                                           ? "bg-blue-900/30"
//                                           : "bg-blue-50"
//                                         : isDark
//                                         ? "hover:bg-gray-700"
//                                         : "hover:bg-gray-50"
//                                     }`}
//                                   >
//                                     <td className="px-4 py-4">
//                                       <div className="flex items-center gap-3">
//                                         <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
//                                           <User className="h-4 w-4 text-white" />
//                                         </div>
//                                         <div>
//                                           <div
//                                             className={`text-sm font-medium ${
//                                               isDark
//                                                 ? "text-white"
//                                                 : "text-gray-900"
//                                             }`}
//                                           >
//                                             {employee.name}
//                                           </div>
//                                           <div
//                                             className={`text-xs ${
//                                               isDark
//                                                 ? "text-gray-400"
//                                                 : "text-gray-500"
//                                             }`}
//                                           >
//                                             {employee.cardNumber} •{" "}
//                                             {employee.gender === "female"
//                                               ? "♀"
//                                               : "♂"}
//                                             {employee.isHighlySkilled && (
//                                               <span className="ml-1">
//                                                 <Star className="inline h-3 w-3 text-yellow-500" />
//                                               </span>
//                                             )}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </td>
//                                     <td className="px-4 py-4 text-center">
//                                       <div className="flex flex-col items-center gap-1">
//                                         <span
//                                           className={`text-sm font-semibold ${
//                                             matchPercentage >= 80
//                                               ? "text-green-600"
//                                               : matchPercentage >= 50
//                                               ? "text-yellow-600"
//                                               : "text-red-600"
//                                           }`}
//                                         >
//                                           {matchPercentage}%
//                                         </span>
//                                         <span
//                                           className={`text-xs ${
//                                             isDark
//                                               ? "text-gray-400"
//                                               : "text-gray-500"
//                                           }`}
//                                         >
//                                           {matchedSkills.length}/
//                                           {allRequiredSkills.length}
//                                         </span>
//                                       </div>
//                                     </td>
//                                     {allRequiredSkills.map((skill) => {
//                                       const skillLevel =
//                                         employee.skills[skill] || "None";
//                                       const hasSkill = skillLevel !== "None";
//                                       return (
//                                         <td
//                                           key={skill}
//                                           className="px-3 py-4 text-center"
//                                         >
//                                           <div className="flex flex-col items-center gap-1">
//                                             <div
//                                               className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
//                                                 hasSkill
//                                                   ? skillLevel === "Expert"
//                                                     ? "bg-green-600 text-white"
//                                                     : skillLevel ===
//                                                       "Intermediate"
//                                                     ? "bg-yellow-500 text-white"
//                                                     : "bg-blue-500 text-white"
//                                                   : isDark
//                                                   ? "bg-gray-600 text-gray-400"
//                                                   : "bg-gray-200 text-gray-500"
//                                               }`}
//                                             >
//                                               {hasSkill
//                                                 ? skillLevel === "Expert"
//                                                   ? "E"
//                                                   : skillLevel ===
//                                                     "Intermediate"
//                                                   ? "I"
//                                                   : "B"
//                                                 : "✗"}
//                                             </div>
//                                             <span
//                                               className={`text-xs ${
//                                                 hasSkill
//                                                   ? isDark
//                                                     ? "text-green-400"
//                                                     : "text-green-600"
//                                                   : isDark
//                                                   ? "text-red-400"
//                                                   : "text-red-600"
//                                               }`}
//                                             >
//                                               {hasSkill
//                                                 ? skillLevel.slice(0, 3)
//                                                 : "None"}
//                                             </span>
//                                           </div>
//                                         </td>
//                                       );
//                                     })}
//                                     <td className="px-4 py-4 text-center">
//                                       <Button
//                                         onClick={() =>
//                                           handleEmployeeToggle(employee.id)
//                                         }
//                                         variant={
//                                           isSelected ? "primary" : "outline"
//                                         }
//                                         size="sm"
//                                       >
//                                         {isSelected ? "Selected" : "Select"}
//                                       </Button>
//                                     </td>
//                                   </tr>
//                                 );
//                               })}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>

//                       {/* Skills Legend */}
//                       <div
//                         className={`mt-4 p-3 rounded-lg ${
//                           isDark ? "bg-gray-700/50" : "bg-gray-50"
//                         }`}
//                       >
//                         <p
//                           className={`text-sm font-medium mb-2 ${
//                             isDark ? "text-gray-300" : "text-gray-700"
//                           }`}
//                         >
//                           Skill Level Legend:
//                         </p>
//                         <div className="flex flex-wrap gap-4 text-xs">
//                           <div className="flex items-center gap-2">
//                             <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
//                               E
//                             </div>
//                             <span
//                               className={
//                                 isDark ? "text-gray-300" : "text-gray-600"
//                               }
//                             >
//                               Expert
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
//                               I
//                             </div>
//                             <span
//                               className={
//                                 isDark ? "text-gray-300" : "text-gray-600"
//                               }
//                             >
//                               Intermediate
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
//                               B
//                             </div>
//                             <span
//                               className={
//                                 isDark ? "text-gray-300" : "text-gray-600"
//                               }
//                             >
//                               Beginner
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <div
//                               className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
//                                 isDark
//                                   ? "bg-gray-600 text-gray-400"
//                                   : "bg-gray-200 text-gray-500"
//                               }`}
//                             >
//                               ✗
//                             </div>
//                             <span
//                               className={
//                                 isDark ? "text-gray-300" : "text-gray-600"
//                               }
//                             >
//                               No Skill
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {matchingEmployees.length === 0 &&
//                     selectedMachines.length > 0 && (
//                       <div className="text-center py-12">
//                         <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                         <p
//                           className={`text-lg font-medium ${
//                             isDark ? "text-gray-300" : "text-gray-600"
//                           }`}
//                         >
//                           No matching workers found
//                         </p>
//                         <p
//                           className={`text-sm ${
//                             isDark ? "text-gray-400" : "text-gray-500"
//                           }`}
//                         >
//                           Try selecting different machines or check worker
//                           availability
//                         </p>
//                       </div>
//                     )}

//                   {selectedMachines.length === 0 && (
//                     <div className="text-center py-12">
//                       <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                       <p
//                         className={`text-lg font-medium ${
//                           isDark ? "text-gray-300" : "text-gray-600"
//                         }`}
//                       >
//                         Select machines first
//                       </p>
//                       <p
//                         className={`text-sm ${
//                           isDark ? "text-gray-400" : "text-gray-500"
//                         }`}
//                       >
//                         Choose one or more machines to see available workers
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Assignment Summary */}
//           {selectedMachines.length > 0 && selectedEmployees.length > 0 && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className={`p-6 rounded-xl border-2 ${
//                 isDark
//                   ? "bg-green-900/20 border-green-500/30"
//                   : "bg-green-50 border-green-200"
//               }`}
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <CheckCircle className="h-6 w-6 text-green-600" />
//                 <h3
//                   className={`text-lg font-semibold ${
//                     isDark ? "text-white" : "text-gray-900"
//                   }`}
//                 >
//                   Assignment Summary
//                 </h3>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Selected Machines */}
//                 <div>
//                   <h4
//                     className={`font-medium mb-4 ${
//                       isDark ? "text-gray-300" : "text-gray-700"
//                     }`}
//                   >
//                     Selected Machines ({selectedMachines.length}):
//                   </h4>
//                   <div className="space-y-3">
//                     {selectedMachines.map((machineId) => {
//                       const machine = availableMachines.find(
//                         (m) => m.id === machineId
//                       );
//                       if (!machine) return null;
//                       return (
//                         <div
//                           key={machineId}
//                           className={`p-3 rounded-lg border ${
//                             isDark
//                               ? "bg-gray-800 border-gray-600"
//                               : "bg-white border-gray-200"
//                           }`}
//                         >
//                           <div className="flex items-center justify-between mb-2">
//                             <span
//                               className={`font-medium ${
//                                 isDark ? "text-white" : "text-gray-900"
//                               }`}
//                             >
//                               {machine.name}
//                             </span>
//                             <MachineTagBadge
//                               isCritical={machine.isCritical}
//                               femaleEligible={machine.femaleEligible}
//                               size="sm"
//                             />
//                           </div>
//                           <div className="flex flex-wrap gap-1">
//                             {machine.requiredSkills.map((skill) => (
//                               <span
//                                 key={skill}
//                                 className={`px-2 py-1 rounded text-xs ${
//                                   isDark
//                                     ? "bg-blue-600 text-white"
//                                     : "bg-blue-100 text-blue-800"
//                                 }`}
//                               >
//                                 {skill}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 {/* Selected Workers */}
//                 <div>
//                   <h4
//                     className={`font-medium mb-4 ${
//                       isDark ? "text-gray-300" : "text-gray-700"
//                     }`}
//                   >
//                     Selected Workers ({selectedEmployees.length}):
//                   </h4>
//                   <div className="space-y-3">
//                     {selectedEmployees.map((employeeId) => {
//                       const employee = matchingEmployees.find(
//                         (e) => e.id === employeeId
//                       );
//                       if (!employee) return null;

//                       const matchedSkills = allRequiredSkills.filter(
//                         (skill) => {
//                           const empSkill = employee.skills[skill];
//                           return empSkill && empSkill !== "None";
//                         }
//                       );
//                       const matchPercentage = Math.round(
//                         (matchedSkills.length / allRequiredSkills.length) * 100
//                       );

//                       return (
//                         <div
//                           key={employeeId}
//                           className={`p-3 rounded-lg border ${
//                             isDark
//                               ? "bg-gray-800 border-gray-600"
//                               : "bg-white border-gray-200"
//                           }`}
//                         >
//                           <div className="flex items-center justify-between mb-2">
//                             <div className="flex items-center gap-2">
//                               <span
//                                 className={`font-medium ${
//                                   isDark ? "text-white" : "text-gray-900"
//                                 }`}
//                               >
//                                 {employee.name}
//                               </span>
//                               <span
//                                 className={`text-sm ${
//                                   isDark ? "text-gray-400" : "text-gray-600"
//                                 }`}
//                               >
//                                 ({employee.gender === "female" ? "♀" : "♂"})
//                               </span>
//                               {employee.isHighlySkilled && (
//                                 <Star className="h-4 w-4 text-yellow-500" />
//                               )}
//                             </div>
//                             <span
//                               className={`text-sm font-semibold px-2 py-1 rounded ${
//                                 matchPercentage >= 80
//                                   ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
//                                   : matchPercentage >= 50
//                                   ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
//                                   : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
//                               }`}
//                             >
//                               {matchPercentage}% match
//                             </span>
//                           </div>
//                           <div
//                             className={`text-sm ${
//                               isDark ? "text-gray-400" : "text-gray-600"
//                             }`}
//                           >
//                             Matches {matchedSkills.length} of{" "}
//                             {allRequiredSkills.length} required skills
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>

//               {/* Assignment Actions */}
//               <div className="mt-8 pt-6 border-t border-green-200 dark:border-green-800">
//                 <div className="flex flex-wrap gap-3">
//                   <Button variant="primary" className="flex items-center gap-2">
//                     <CheckCircle className="h-4 w-4" />
//                     Confirm Assignment
//                   </Button>
//                   <Button variant="outline">Save as Draft</Button>
//                   <Button variant="outline">Export Assignment</Button>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

export default function StaffingAssignmentPage() {
  return <div className="p-8 text-center text-muted-foreground">Staffing Assignment coming soon.</div>;
}
