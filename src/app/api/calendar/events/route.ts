import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";
    const date = searchParams.get("date")
      ? new Date(searchParams.get("date")!)
      : new Date();

    let startDate, endDate;
    if (period === "week") {
      startDate = startOfWeek(date, { weekStartsOn: 1 });
      endDate = endOfWeek(date, { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    console.log("OAuth2 client configured, attempting calendar API call...");

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    console.log(
      "Calendar API call successful, events found:",
      response.data.items?.length || 0
    );

    const events = response.data.items || [];

    //Process events to categorize them
    const processedEvents = events.map((event) => ({
      googleEventId: event.id,
      title: event.summary || "Untitled Event",
      description: event.description || "",
      category: categorizeEvent(event),
      scheduledStart: event.start?.dateTime || event.start?.date,
      scheduledEnd: event.end?.dateTime || event.end?.date,
    }));

    return NextResponse.json(processedEvents);
  } catch (error) {
    console.error("error fetching calendar events: ", error);
    return NextResponse.json(
      { error: "Failed to fetch the calendar events" },
      { status: 500 }
    );
  }
}

function categorizeEvent(event: any) {
  const title = (event.summary || "").toLowerCase();
  const description = (event.description || "").toLowerCase();

  if (title.includes("work") || title.includes("meeting")) {
    return "work";
  } else if (title.includes("workout") || title.includes("gym")) {
    return "health";
  } else if (title.includes("study") || title.includes("learn")) {
    return "learning";
  } else if (title.includes("personal")) {
    return "personal";
  }

  return "other";
}
