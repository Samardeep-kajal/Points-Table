# 📊 Task Alignment Tracker

A responsive web application to track how well you align with your Google Calendar schedule and calculate success/failure rates with a points system.

## Features

- **📅 Task Management**: Add, track, and complete tasks with scheduled times
- **🎯 Alignment Scoring**: Calculate how well you stick to your planned schedule
- **📈 Progress Tracking**: Weekly and monthly statistics with trend analysis
- **🏆 Points System**: Earn points based on task completion and alignment
- **📱 Mobile Responsive**: Optimized for both desktop and mobile use
- **📊 Visual Analytics**: Charts and graphs to visualize your progress
- **🏷️ Category Filtering**: Organize tasks by Work, Personal, Health, Learning, and Other

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```
   MONGODB_URI=mongodb://localhost:27017/points-table
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Start MongoDB service on your machine

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### Alignment Scoring System

The app calculates an alignment score (0-100) based on:

- **Timing Accuracy**: How close your actual start/end times are to scheduled times
- **Duration Accuracy**: How well your actual task duration matches the planned duration
- **Completion Status**: Whether you completed the task or not

### Points System

- **Base Points**: 10 points for completing any task
- **Bonus Points**: Up to 20 additional points based on alignment score
- **Maximum**: 30 points per perfectly aligned completed task

### Categories

Tasks are organized into five categories:

- 🏢 **Work**: Professional tasks and meetings
- 👤 **Personal**: Personal errands and activities
- 🏃 **Health**: Exercise, medical appointments, wellness
- 📚 **Learning**: Study, courses, skill development
- 📋 **Other**: Miscellaneous tasks

## Usage

1. **Add Tasks**: Click "Add Task" to create new scheduled tasks
2. **Track Progress**: Mark tasks as complete when finished
3. **View Analytics**: Switch between weekly and monthly views
4. **Monitor Trends**: Use the charts to see your improvement over time
5. **Filter Tasks**: Use category filters to focus on specific areas

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with responsive design

## Mobile Optimization

The app is fully responsive and optimized for mobile use:

- Touch-friendly interface
- Responsive grid layouts
- Mobile-first design approach
- Optimized for various screen sizes

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is for personal use.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
