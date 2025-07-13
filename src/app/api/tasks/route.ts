import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Task } from "@/models";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

// Calculate alignment score based on how well task was executed vs scheduled
function calculateAlignmentScore(task: any): number {
  if (!task.isCompleted) return 0;

  const scheduledDuration =
    new Date(task.scheduledEnd).getTime() -
    new Date(task.scheduledStart).getTime();
  const actualDuration = task.actualEnd
    ? new Date(task.actualEnd).getTime() - new Date(task.actualStart).getTime()
    : 0;

  if (!task.actualStart || !task.actualEnd) return 50; // Partial completion

  // Calculate timing accuracy (how close actual start/end were to scheduled)
  const startDelay = Math.abs(
    new Date(task.actualStart).getTime() -
      new Date(task.scheduledStart).getTime()
  );
  const endDelay = Math.abs(
    new Date(task.actualEnd).getTime() - new Date(task.scheduledEnd).getTime()
  );

  // Calculate duration accuracy
  const durationAccuracy =
    Math.abs(actualDuration - scheduledDuration) / scheduledDuration;

  // Score calculation (0-100)
  const timingScore = Math.max(
    0,
    100 - (startDelay + endDelay) / (1000 * 60 * 30)
  ); // 30 min penalty per delay
  const durationScore = Math.max(0, 100 - durationAccuracy * 100);

  return Math.min(100, Math.max(0, (timingScore + durationScore) / 2));
}

// Calculate points based on alignment score and task completion
function calculatePoints(alignmentScore: number, isCompleted: boolean): number {
  if (!isCompleted) return 0;

  const basePoints = 10;
  const bonusPoints = Math.round((alignmentScore / 100) * 20);

  return basePoints + bonusPoints;
}

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

    if (period === "week") {
      startDate = startOfWeek(date, { weekStartsOn: 1 });
      endDate = endOfWeek(date, { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
    }

    const tasks = await Task.find({
      scheduledStart: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ scheduledStart: 1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, description, category, scheduledStart, scheduledEnd } = body;

    const task = new Task({
      title,
      description,
      category,
      scheduledStart: new Date(scheduledStart),
      scheduledEnd: new Date(scheduledEnd),
    });

    await task.save();

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, actualStart, actualEnd, isCompleted } = body;

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update task fields
    if (actualStart) task.actualStart = new Date(actualStart);
    if (actualEnd) task.actualEnd = new Date(actualEnd);
    if (typeof isCompleted === "boolean") task.isCompleted = isCompleted;

    // Recalculate alignment score and points
    task.alignmentScore = calculateAlignmentScore(task);
    task.points = calculatePoints(task.alignmentScore, task.isCompleted);

    await task.save();

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
