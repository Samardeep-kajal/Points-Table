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
import AuthButton from "@/components/AuthButton";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Task Alignment Tracker
              </h1>
              <p className="text-gray-600">
                Track how well you align with your Google Calendar schedule
              </p>
            </div>
            <AuthButton />
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setPeriod("week")}
              className={`px-4 py-2 rounded-md transition-colors ${
                period === "week"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 rounded-md transition-colors ${
                period === "month"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
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
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-600 text-sm">Completion Rate</span>
                </div>
                {stats.current.successRate >
                (stats.previous?.successRate || 0) ? (
                  <TrendingUp className="text-green-600" size={16} />
                ) : (
                  <TrendingDown className="text-red-600" size={16} />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.current.successRate || 0}%
              </div>
              <div className="text-sm text-gray-500">
                {stats.current.completedTasks || 0} /{" "}
                {stats.current.totalTasks || 0} tasks
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="text-blue-600" size={20} />
                  <span className="text-gray-600 text-sm">Alignment Score</span>
                </div>
                {stats.current.averageAlignment >
                (stats.previous?.averageAlignment || 0) ? (
                  <TrendingUp className="text-green-600" size={16} />
                ) : (
                  <TrendingDown className="text-red-600" size={16} />
                )}
              </div>
              <div
                className={`text-2xl font-bold mb-1 ${getAlignmentColor(
                  stats.current.averageAlignment || 0
                )}`}
              >
                {stats.current.averageAlignment || 0}/100
              </div>
              <div className="text-sm text-gray-500">Schedule adherence</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="text-purple-600" size={20} />
                  <span className="text-gray-600 text-sm">Points Earned</span>
                </div>
                {stats.current.totalPoints >
                (stats.previous?.totalPoints || 0) ? (
                  <TrendingUp className="text-green-600" size={16} />
                ) : (
                  <TrendingDown className="text-red-600" size={16} />
                )}
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.current.totalPoints || 0}
              </div>
              <div className="text-sm text-gray-500">This {period}</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="text-orange-600" size={20} />
                  <span className="text-gray-600 text-sm">Time Period</span>
                </div>
                <Calendar className="text-gray-400" size={16} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {period === "week" ? "This Week" : "This Month"}
              </div>
              <div className="text-sm text-gray-500">
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
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Progress Trend
            </h3>
            {stats?.historical && stats.historical.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.historical}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
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
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No historical data available</p>
                  <p className="text-sm">
                    Complete some tasks to see your progress!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PieChart size={48} className="mx-auto mb-4 text-gray-300" />
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
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tasks ({filteredTasks.length})
              </h3>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="divide-y divide-gray-200">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No tasks found for this period</p>
                <p className="text-sm">
                  Add some tasks to start tracking your alignment!
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
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
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {task.isCompleted && (
                            <CheckCircle size={14} className="text-white" />
                          )}
                        </button>
                        <h4
                          className={`font-medium ${
                            task.isCompleted
                              ? "line-through text-gray-500"
                              : "text-gray-900"
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
                              ] + "20",
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
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                              <span className="text-purple-600">
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
