"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Bot, Send, Users, Award, Clock, Building2, Wifi, WifiOff, Zap, Sparkles, TrendingUp, Star, Trophy, UserCheck, Briefcase, BarChart, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types
interface Employee {
  id: string | number;
  name: string;
  department: string;
  skillLevel: string;
  performanceScore?: number;
  gender: string;
  yearsExperience?: number;
  title?: string;
  machineSkills?: string[];
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  data?: any;
  type?: "text" | "employee-list" | "diversity-report" | "department-stats" | "machine-skills";
}

// Utility functions
const getSkillIcon = (skillLevel: string) => {
  const level = skillLevel?.toLowerCase();
  if (level?.includes("advanced") || level?.includes("expert")) return <Trophy className="h-4 w-4" />;
  if (level?.includes("high")) return <Star className="h-4 w-4" />;
  if (level?.includes("medium")) return <UserCheck className="h-4 w-4" />;
  return <Briefcase className="h-4 w-4" />;
};

const getSkillColor = (skillLevel: string) => {
  const level = skillLevel?.toLowerCase();
  return "bg-blue-600";
};

// Enhanced Components
const EmployeeCard = ({ emp, index, showRanking = true }: { emp: any; index: number; showRanking?: boolean }) => (
  <div className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        {showRanking && (
          <div className="relative">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
              #{index + 1}
            </div>
            {index < 3 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <Trophy className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {emp.name}
          </h4>
          <p className="text-gray-600 font-medium">{emp.title || emp.department}</p>
          {emp.performanceScore && (
            <div className="flex items-center gap-2 mt-1">
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                Score: {emp.performanceScore}/100
              </div>
            </div>
          )}
        </div>
      </div>
      <Badge className={`bg-blue-600 text-white border-0 shadow-md flex items-center gap-1 px-3 py-1`}>
        {getSkillIcon(emp.skillLevel)}
        {emp.skillLevel}
      </Badge>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
      {emp.yearsExperience && (
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{emp.yearsExperience}</div>
          <div className="text-xs text-gray-500 font-medium">Years Exp.</div>
        </div>
      )}
      {emp.gender && (
        <div className="text-center">
          <div className="text-sm font-bold text-gray-700">{emp.gender}</div>
          <div className="text-xs text-gray-500 font-medium">Gender</div>
        </div>
      )}
      <div className="text-center">
        <div className="text-sm font-bold text-purple-600">{emp.department}</div>
        <div className="text-xs text-gray-500 font-medium">Department</div>
      </div>
    </div>

    {emp.machineSkills && emp.machineSkills.length > 0 && (
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">Machine Skills</span>
        </div>
        <div className="text-sm text-blue-700 font-medium">
          {emp.machineSkills.join(" • ")}
        </div>
      </div>
    )}

    {emp.reason && (
      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-green-600" />
          <span className="text-sm font-semibold text-green-800">Why Selected</span>
        </div>
        <div className="text-sm text-green-700 leading-relaxed">{emp.reason}</div>
      </div>
    )}
  </div>
);

const StatCard = ({ title, value, subtitle, icon, color }: any) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
    <div className="mb-4">
      <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
        {icon}
      </div>
    </div>
    <h4 className="text-lg font-bold text-gray-800 mb-1">{title}</h4>
    <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
    <div className="text-sm text-gray-500">{subtitle}</div>
  </div>
);

// Rendering functions
const renderEmployeeList = (data: any) => (
  <div className="space-y-6">
    <div className="bg-blue-50 p-6 rounded-xl border shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Users className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{data.title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed">{data.summary}</p>
    </div>
    <div className="grid gap-4">
      {data.employees?.map((emp: any, index: number) => (
        <EmployeeCard key={index} emp={emp} index={index} />
      ))}
    </div>
  </div>
);

const renderDiversityReport = (data: any) => (
  <div className="space-y-6">
    <div className="bg-blue-50 p-6 rounded-xl border shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Gender Diversity Report</h3>
      </div>
      <p className="text-gray-600">Department-wise gender distribution analysis</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard
        title="Female Employees"
        value={`${data.femaleCount}`}
        subtitle={`${data.femalePercentage}% of workforce`}
        icon={<Users className="h-8 w-8" />}
        color="bg-blue-600"
      />
      <StatCard
        title="Male Employees"
        value={`${data.maleCount}`}
        subtitle={`${100 - data.femalePercentage}% of workforce`}
        icon={<Users className="h-8 w-8" />}
        color="bg-blue-600"
      />
    </div>

    {data.departmentBreakdown && (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Department Breakdown</h4>
        <div className="space-y-3">
          {data.departmentBreakdown.map((dept: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-800">{dept.department}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {dept.femaleCount}F / {dept.maleCount}M
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {dept.femalePercentage}% Female
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const renderDepartmentStats = (data: any) => (
  <div className="space-y-6">
    <div className="bg-blue-50 p-6 rounded-xl border shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{data.title}</h3>
      </div>
      <p className="text-gray-600">{data.summary}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Employees"
        value={data.totalEmployees}
        subtitle="in department"
        icon={<Users className="h-8 w-8" />}
        color="bg-blue-600"
      />
      <StatCard
        title="Avg Experience"
        value={`${data.avgExperience} yrs`}
        subtitle="team average"
        icon={<Clock className="h-8 w-8" />}
        color="bg-blue-600"
      />
      <StatCard
        title="Skill Levels"
        value={data.skillDistribution?.advanced || 0}
        subtitle="advanced skilled"
        icon={<Award className="h-8 w-8" />}
        color="bg-blue-600"
      />
    </div>
  </div>
);

const renderMachineSkills = (data: any) => (
  <div className="space-y-6">
    <div className="bg-blue-50 p-6 rounded-xl border shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <BarChart className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{data.title}</h3>
      </div>
      <p className="text-gray-600">{data.summary}</p>
    </div>
    <div className="grid gap-4">
      {data.employees?.map((emp: any, index: number) => (
        <EmployeeCard key={index} emp={emp} index={index} showRanking={false} />
      ))}
    </div>
  </div>
);

// Enhanced AI Service
const callAIService = async (prompt: string, data: Employee[]): Promise<Message> => {
  // Quick responses for greetings
  const greetings = ["hello", "hi", "hey", "help"];
  if (greetings.some(g => prompt.toLowerCase().includes(g)) && prompt.length < 20) {
    return {
      id: Date.now().toString(),
      text: `Hi! 👋 I'm your Skills Matrix Assistant.\n\n🔍 I can help you with:\n• Top performers by department\n• Gender diversity analysis\n• Employee counts and statistics\n• Machine/skill expertise\n• Performance insights\n\n📊 Database: ${data.length} employees across ${[...new Set(data.map(e => e.department))].length} departments\n\nWhat would you like to analyze?`,
      isUser: false,
      timestamp: new Date(),
      type: "text",
    };
  }

  // Enhanced context with better structure
  const context = {
    totalEmployees: data.length,
    departments: [...new Set(data.map(e => e.department))],
    skillLevels: [...new Set(data.map(e => e.skillLevel))],
    genderBreakdown: {
      male: data.filter(e => e.gender?.toLowerCase() === 'male').length,
      female: data.filter(e => e.gender?.toLowerCase() === 'female').length
    },
    departmentStats: [...new Set(data.map(e => e.department))].map(dept => ({
      name: dept,
      count: data.filter(e => e.department === dept).length,
      avgExperience: Math.round(
        data.filter(e => e.department === dept && e.yearsExperience)
          .reduce((sum, e) => sum + (e.yearsExperience || 0), 0) /
        data.filter(e => e.department === dept && e.yearsExperience).length || 0
      ),
      skillDistribution: {
        advanced: data.filter(e => e.department === dept && e.skillLevel?.toLowerCase().includes('advanced')).length,
        high: data.filter(e => e.department === dept && e.skillLevel?.toLowerCase().includes('high')).length,
        medium: data.filter(e => e.department === dept && e.skillLevel?.toLowerCase().includes('medium')).length
      }
    })),
    sampleEmployees: data.slice(0, 10).map(e => ({
      name: e.name,
      department: e.department,
      skillLevel: e.skillLevel,
      yearsExperience: e.yearsExperience,
      gender: e.gender,
      performanceScore: e.performanceScore,
      machineSkills: e.machineSkills
    }))
  };

  const enhancedPrompt = `
You are an expert HR Analytics AI assistant for a Skills Matrix system. Analyze employee data and provide structured JSON responses.

CONTEXT DATA:
${JSON.stringify(context, null, 2)}

USER QUERY: "${prompt}"

RESPONSE RULES:
1. Always respond with valid JSON
2. Include relevant employee details with reasoning
3. For top performers: rank by performance score, experience, and skill level
4. For diversity queries: provide gender breakdown with percentages
5. For department stats: include counts, averages, and skill distribution
6. For machine/skill queries: filter by specific skills mentioned

RESPONSE FORMATS:

For TOP EMPLOYEES queries:
{
  "type": "employee-list",
  "title": "Top [Department] Employees",
  "summary": "Analysis based on performance scores, experience, and skill levels",
  "employees": [
    {
      "name": "Employee Name",
      "department": "Department",
      "skillLevel": "Advanced/High/Medium",
      "yearsExperience": number,
      "performanceScore": number,
      "reason": "Why this employee ranks high (performance metrics, experience, skills)",
      "machineSkills": ["skill1", "skill2"]
    }
  ]
}

For DIVERSITY queries:
{
  "type": "diversity-report", 
  "femaleCount": number,
  "maleCount": number,
  "femalePercentage": number,
  "departmentBreakdown": [
    {
      "department": "Dept Name",
      "femaleCount": number,
      "maleCount": number, 
      "femalePercentage": number
    }
  ]
}

For DEPARTMENT STATS:
{
  "type": "department-stats",
  "title": "[Department] Statistics", 
  "summary": "Department overview and metrics",
  "totalEmployees": number,
  "avgExperience": number,
  "skillDistribution": {"advanced": number, "high": number, "medium": number}
}

For MACHINE/SKILL queries:
{
  "type": "machine-skills",
  "title": "Most Skilled in [Machine/Skill]",
  "summary": "Employees with expertise in specific machines or skills", 
  "employees": [employee objects with machineSkills highlighted]
}

Provide insights and rank employees logically. Always include reasoning for selections.
`;

  try {
    // Simulate API call - replace with your actual API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: enhancedPrompt }),
    });

    if (!response.ok) throw new Error("API request failed");
    
    const result = await response.json();
    const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || result.response;

    // Clean and parse JSON
    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }

    const parsedResponse = JSON.parse(cleanResponse);

    // Route response based on type
    switch (parsedResponse.type) {
      case "employee-list":
        // Check if no employees found
        if (!parsedResponse.employees || parsedResponse.employees.length === 0) {
          return {
            id: Date.now().toString(),
            text: parsedResponse.message || "No employees found matching your criteria. Please try refining your search or ask about a different department.",
            isUser: false,
            timestamp: new Date(),
            type: "text"
          };
        }
        return {
          id: Date.now().toString(),
          text: `Found ${parsedResponse.employees?.length || 0} top employees`,
          isUser: false,
          timestamp: new Date(),
          type: "employee-list",
          data: parsedResponse
        };

      case "diversity-report":
        return {
          id: Date.now().toString(),
          text: "Gender diversity analysis completed",
          isUser: false,
          timestamp: new Date(),
          type: "diversity-report",
          data: parsedResponse
        };

      case "department-stats":
        return {
          id: Date.now().toString(),
          text: "Department statistics generated",
          isUser: false,
          timestamp: new Date(),
          type: "department-stats", 
          data: parsedResponse
        };

      case "machine-skills":
        // Check if no employees found for machine skills
        if (!parsedResponse.employees || parsedResponse.employees.length === 0) {
          return {
            id: Date.now().toString(),
            text: parsedResponse.message || "No employees found with the specified machine skills. Please try searching for different skills or machines.",
            isUser: false,
            timestamp: new Date(),
            type: "text"
          };
        }
        return {
          id: Date.now().toString(),
          text: "Machine skills analysis completed",
          isUser: false,
          timestamp: new Date(),
          type: "machine-skills",
          data: parsedResponse
        };

      default:
        return {
          id: Date.now().toString(),
          text: parsedResponse.message || "Analysis completed. Please try asking about specific departments, diversity metrics, or skill requirements.",
          isUser: false,
          timestamp: new Date(),
          type: "text"
        };
    }
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      id: Date.now().toString(),
      text: `I couldn't find any employees matching your request. Please try:\n\n• Checking the department name spelling\n• Asking about a different department\n• Using more general terms (e.g., "show employees" instead of specific names)\n• Asking about available departments first`,
      isUser: false,
      timestamp: new Date(),
      type: "text",
    };
  }
};

// Main Component
export default function SkillsMatrixChatbot({ data }: { data: Employee[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset chat when opening
  const handleOpenChat = () => {
    setMessages([]);
    setInputValue("");
    setIsLoading(false);
    setIsOpen(true);
  };

  const quickPrompts = [
    {
      text: "Show me top 10 employees in Sheet Molding department",
      icon: <Users className="h-4 w-4" />,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      text: "What's the female ratio in all departments?",
      icon: <TrendingUp className="h-4 w-4" />,
      gradient: "from-pink-500 to-purple-500"
    },
    {
      text: "Who are the most skilled employees for injection molding machine?",
      icon: <Award className="h-4 w-4" />,
      gradient: "from-orange-500 to-red-500"
    },
    {
      text: "How many employees are in Quality Control department?",
      icon: <Building2 className="h-4 w-4" />,
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
      type: "text",
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const aiResponse = await callAIService(text.trim(), data);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I encountered an error. Please try again with a different question.",
        isUser: false,
        timestamp: new Date(),
        type: "text",
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleOpenChat}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 group"
        >
          <Bot className="h-8 w-8 text-white" />
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-bounce" />
        </Button>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-5xl h-[85vh] mx-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="h-8 w-8" />
                  <div>
                    <h2 className="text-xl font-bold">Skills Matrix Assistant</h2>
                    <p className="text-blue-100 text-sm">AI-powered employee analytics</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Skills Matrix Analytics</h3>
                    <p className="text-gray-600 mb-6">Ask me about employees, departments, skills, or diversity metrics</p>
                    
                    <div className="grid gap-3 md:grid-cols-2">
                      {quickPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(prompt.text)}
                          className="group p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300 text-left"
                        >
                          <div className={`inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r ${prompt.gradient} rounded-lg mb-2 group-hover:scale-110 transition-transform`}>
                            {prompt.icon}
                          </div>
                          <p className="text-sm text-gray-700 font-medium">{prompt.text}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-3 max-w-4xl ${message.isUser ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="flex-shrink-0">
                        {message.isUser ? (
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            U
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div className={`flex flex-col ${message.isUser ? "items-end" : "items-start"}`}>
                        <div className={`${
                          message.isUser
                            ? "p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white max-w-md"
                            : message.type === "text"
                            ? "p-4 rounded-2xl bg-gray-50 text-gray-800 border border-gray-200 max-w-2xl"
                            : "w-full"
                        }`}>
                          {message.type === "employee-list" && message.data ? renderEmployeeList(message.data)
                          : message.type === "diversity-report" && message.data ? renderDiversityReport(message.data)
                          : message.type === "department-stats" && message.data ? renderDepartmentStats(message.data)
                          : message.type === "machine-skills" && message.data ? renderMachineSkills(message.data)
                          : <div className="whitespace-pre-wrap">{message.text}</div>
                          }
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <span className="text-gray-600 text-sm ml-2">Analyzing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Ask about employees, departments, skills, diversity metrics..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage(inputValue)}
                      disabled={isLoading}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={isLoading || !inputValue.trim()}
                    className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}