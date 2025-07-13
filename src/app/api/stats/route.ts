import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Task } from "@/models";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
} from "date-fns";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";
    const date = searchParams.get("date")
      ? new Date(searchParams.get("date")!)
      : new Date();

    let startDate: Date;
    let endDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    if (period === "week") {
      startDate = startOfWeek(date, { weekStartsOn: 1 });
      endDate = endOfWeek(date, { weekStartsOn: 1 });
      previousStartDate = startOfWeek(subWeeks(date, 1), { weekStartsOn: 1 });
      previousEndDate = endOfWeek(subWeeks(date, 1), { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
      previousStartDate = startOfMonth(subMonths(date, 1));
      previousEndDate = endOfMonth(subMonths(date, 1));
    }

    // Get current period tasks
    const currentTasks = await Task.find({
      scheduledStart: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // Get previous period tasks for comparison
    const previousTasks = await Task.find({
      scheduledStart: {
        $gte: previousStartDate,
        $lte: previousEndDate,
      },
    });

    // Calculate current period stats
    const currentStats = calculateStats(currentTasks);
    const previousStats = calculateStats(previousTasks);

    // Get historical data for charts (last 12 weeks/months)
    const historicalData = await getHistoricalData(period, date);

    return NextResponse.json({
      current: {
        ...currentStats,
        period: period,
        startDate,
        endDate,
      },
      previous: {
        ...previousStats,
        period: period,
        startDate: previousStartDate,
        endDate: previousEndDate,
      },
      historical: historicalData,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

function calculateStats(tasks: any[]) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.isCompleted).length;
  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const averageAlignment =
    totalTasks > 0
      ? tasks.reduce((sum, task) => sum + task.alignmentScore, 0) / totalTasks
      : 0;
  const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Category breakdown
  const categoryStats = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = { total: 0, completed: 0, points: 0 };
    }
    acc[task.category].total++;
    if (task.isCompleted) {
      acc[task.category].completed++;
      acc[task.category].points += task.points;
    }
    return acc;
  }, {});

  return {
    totalTasks,
    completedTasks,
    totalPoints,
    averageAlignment: Math.round(averageAlignment),
    successRate: Math.round(successRate),
    categoryStats,
  };
}

async function getHistoricalData(period: string, currentDate: Date) {
  const data = [];
  const periods = period === "week" ? 12 : 12; // Last 12 weeks or months

  for (let i = periods - 1; i >= 0; i--) {
    let startDate: Date;
    let endDate: Date;
    let label: string;

    if (period === "week") {
      const weekDate = subWeeks(currentDate, i);
      startDate = startOfWeek(weekDate, { weekStartsOn: 1 });
      endDate = endOfWeek(weekDate, { weekStartsOn: 1 });
      label = `Week ${startDate.getDate()}/${startDate.getMonth() + 1}`;
    } else {
      const monthDate = subMonths(currentDate, i);
      startDate = startOfMonth(monthDate);
      endDate = endOfMonth(monthDate);
      label = monthDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }

    const tasks = await Task.find({
      scheduledStart: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const stats = calculateStats(tasks);

    data.push({
      label,
      ...stats,
      date: startDate.toISOString(),
    });
  }

  return data;
}
