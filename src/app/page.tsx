"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Plus,
  BarChart3,
  PieChart,
  Award,
  Filter,
  Moon,
  Sun,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";
import AddTaskModal from "@/components/AddTaskModal";
import { useTheme } from "@/contexts/ThemeContext";

interface Task {
  _id: string;
  title: string;
  description?: string;
  category: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  isCompleted: boolean;
  alignmentScore: number;
  points: number;
}

interface Stats {
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  averageAlignment: number;
  successRate: number;
  categoryStats: Record<
    string,
    { total: number; completed: number; points: number }
  >;
}

interface StatsData {
  current: Stats & { period: string; startDate: string; endDate: string };
  previous: Stats & { period: string; startDate: string; endDate: string };
  historical: Array<Stats & { label: string; date: string }>;
}

const CATEGORY_COLORS = {
  work: "#3B82F6",
  personal: "#10B981",
  health: "#F59E0B",
  learning: "#8B5CF6",
  other: "#6B7280",
};

const CATEGORY_NAMES = {
  work: "Work",
  personal: "Personal",
  health: "Health",
  learning: "Learning",
  other: "Other",
};

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [showAddTask, setShowAddTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [period]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?period=${period}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stats?period=${period}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, isCompleted: boolean) => {
    try {
      const actualTime = new Date().toISOString();
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: taskId,
          actualStart: isCompleted ? actualTime : null,
          actualEnd: isCompleted ? actualTime : null,
          isCompleted,
        }),
      });

      if (response.ok) {
        fetchTasks();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const filteredTasks =
    selectedCategory === "all"
      ? tasks
      : tasks.filter((task) => task.category === selectedCategory);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getAlignmentColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const pieData = stats?.current?.categoryStats
    ? Object.entries(stats.current.categoryStats).map(([category, data]) => ({
        name: CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES],
        value: data.points,
        color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
      }))
    : [];

  // Show loading spinner if data is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading your progress...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                📊 Task Alignment Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track how well you align with your Google Calendar schedule
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 border dark:border-gray-700"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon size={20} className="text-gray-600" />
              ) : (
                <Sun size={20} className="text-yellow-500" />
              )}
            </button>
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border dark:border-gray-700">
            <button
              onClick={() => setPeriod("week")}
              className={`px-4 py-2 rounded-md transition-colors ${
                period === "week"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 rounded-md transition-colors ${
                period === "month"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Monthly
            </button>
          </div>

          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>

        {/* Stats Overview */}
        {stats?.current && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className="text-green-600 dark:text-green-400"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    Completion Rate
                  </span>
                </div>
                {stats.current.successRate >
                (stats.previous?.successRate || 0) ? (
                  <TrendingUp
                    className="text-green-600 dark:text-green-400"
                    size={16}
                  />
                ) : (
                  <TrendingDown
                    className="text-red-600 dark:text-red-400"
                    size={16}
                  />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.current.successRate || 0}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stats.current.completedTasks || 0} /{" "}
                {stats.current.totalTasks || 0} tasks
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target
                    className="text-blue-600 dark:text-blue-400"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    Alignment Score
                  </span>
                </div>
                {stats.current.averageAlignment >
                (stats.previous?.averageAlignment || 0) ? (
                  <TrendingUp
                    className="text-green-600 dark:text-green-400"
                    size={16}
                  />
                ) : (
                  <TrendingDown
                    className="text-red-600 dark:text-red-400"
                    size={16}
                  />
                )}
              </div>
              <div
                className={`text-2xl font-bold mb-1 ${getAlignmentColor(
                  stats.current.averageAlignment || 0
                )}`}
              >
                {stats.current.averageAlignment || 0}/100
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Schedule adherence
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award
                    className="text-purple-600 dark:text-purple-400"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    Points Earned
                  </span>
                </div>
                {stats.current.totalPoints >
                (stats.previous?.totalPoints || 0) ? (
                  <TrendingUp
                    className="text-green-600 dark:text-green-400"
                    size={16}
                  />
                ) : (
                  <TrendingDown
                    className="text-red-600 dark:text-red-400"
                    size={16}
                  />
                )}
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {stats.current.totalPoints || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                This {period}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock
                    className="text-orange-600 dark:text-orange-400"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    Time Period
                  </span>
                </div>
                <Calendar
                  className="text-gray-400 dark:text-gray-500"
                  size={16}
                />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {period === "week" ? "This Week" : "This Month"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stats.current.startDate
                  ? new Date(stats.current.startDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "N/A"}{" "}
                -{" "}
                {stats.current.endDate
                  ? new Date(stats.current.endDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "N/A"}
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Progress Trend
            </h3>
            {stats?.historical && stats.historical.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.historical}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="label"
                    stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"}
                  />
                  <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                      border:
                        theme === "dark"
                          ? "1px solid #374151"
                          : "1px solid #E5E7EB",
                      borderRadius: "8px",
                      color: theme === "dark" ? "#F9FAFB" : "#111827",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Success Rate %"
                  />
                  <Line
                    type="monotone"
                    dataKey="averageAlignment"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Alignment Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BarChart3
                    size={48}
                    className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
                  />
                  <p>No historical data available</p>
                  <p className="text-sm">
                    Complete some tasks to see your progress!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart size={20} />
              Points by Category
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                      border:
                        theme === "dark"
                          ? "1px solid #374151"
                          : "1px solid #E5E7EB",
                      borderRadius: "8px",
                      color: theme === "dark" ? "#F9FAFB" : "#111827",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <PieChart
                    size={48}
                    className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
                  />
                  <p>No category data available</p>
                  <p className="text-sm">
                    Complete some tasks to see the breakdown!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tasks ({filteredTasks.length})
              </h3>
              <div className="flex items-center gap-2">
                <Filter
                  size={16}
                  className="text-gray-400 dark:text-gray-500"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Calendar
                  size={48}
                  className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
                />
                <p>No tasks found for this period</p>
                <p className="text-sm">
                  Add some tasks to start tracking your alignment!
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() =>
                            updateTaskStatus(task._id, !task.isCompleted)
                          }
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.isCompleted
                              ? "bg-green-600 border-green-600"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                        >
                          {task.isCompleted && (
                            <CheckCircle size={14} className="text-white" />
                          )}
                        </button>
                        <h4
                          className={`font-medium ${
                            task.isCompleted
                              ? "line-through text-gray-500 dark:text-gray-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </h4>
                        <span
                          className="px-2 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[
                                task.category as keyof typeof CATEGORY_COLORS
                              ] + (theme === "dark" ? "40" : "20"),
                            color:
                              CATEGORY_COLORS[
                                task.category as keyof typeof CATEGORY_COLORS
                              ],
                          }}
                        >
                          {
                            CATEGORY_NAMES[
                              task.category as keyof typeof CATEGORY_NAMES
                            ]
                          }
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(task.scheduledStart).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
                          -{" "}
                          {new Date(task.scheduledEnd).toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {task.isCompleted && (
                          <>
                            <div className="flex items-center gap-1">
                              <Target size={14} />
                              <span
                                className={getAlignmentColor(
                                  task.alignmentScore
                                )}
                              >
                                {task.alignmentScore}/100
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award size={14} />
                              <span className="text-purple-600 dark:text-purple-400">
                                {task.points} pts
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={showAddTask}
          onClose={() => setShowAddTask(false)}
          onTaskAdded={() => {
            fetchTasks();
            fetchStats();
          }}
        />
      </div>
    </div>
  );
}
