import mongoose from "mongoose";

export interface ITask extends mongoose.Document {
  title: string;
  description?: string;
  category: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  isCompleted: boolean;
  alignmentScore: number; // 0-100 score based on how well aligned with schedule
  points: number; // Points earned for this task
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    googleEventId: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: true,
      enum: ["work", "personal", "health", "learning", "other"],
    },
    scheduledStart: {
      type: Date,
      required: true,
    },
    scheduledEnd: {
      type: Date,
      required: true,
    },
    actualStart: {
      type: Date,
    },
    actualEnd: {
      type: Date,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    alignmentScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export interface IWeeklyStats extends mongoose.Document {
  weekStart: Date;
  weekEnd: Date;
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  averageAlignment: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyStatsSchema = new mongoose.Schema(
  {
    weekStart: {
      type: Date,
      required: true,
    },
    weekEnd: {
      type: Date,
      required: true,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    averageAlignment: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export interface IMonthlyStats extends mongoose.Document {
  monthStart: Date;
  monthEnd: Date;
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  averageAlignment: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const MonthlyStatsSchema = new mongoose.Schema(
  {
    monthStart: {
      type: Date,
      required: true,
    },
    monthEnd: {
      type: Date,
      required: true,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    averageAlignment: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Task =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
export const WeeklyStats =
  mongoose.models.WeeklyStats ||
  mongoose.model<IWeeklyStats>("WeeklyStats", WeeklyStatsSchema);
export const MonthlyStats =
  mongoose.models.MonthlyStats ||
  mongoose.model<IMonthlyStats>("MonthlyStats", MonthlyStatsSchema);
