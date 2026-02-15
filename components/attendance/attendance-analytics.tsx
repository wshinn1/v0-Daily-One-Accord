"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts"

interface Event {
  id: string
  title: string
  start_time: string
  is_default_service?: boolean
  event_type?: string
}

interface Member {
  id: string
  full_name: string
}

interface AttendanceRecord {
  id: string
  event: { title: string; start_time: string; is_default_service?: boolean; event_type?: string }
  user: { full_name: string }
  attended_at: string
}

interface AttendanceAnalyticsProps {
  attendance: AttendanceRecord[]
  events: Event[]
  members: Member[]
}

export function AttendanceAnalytics({ attendance, events, members }: AttendanceAnalyticsProps) {
  const analytics = useMemo(() => {
    const churchServiceAttendance = attendance.filter(
      (record) => record.event.is_default_service || record.event.event_type === "church_service",
    )

    const churchServiceByDate = churchServiceAttendance.reduce(
      (acc, record) => {
        const date = new Date(record.attended_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        acc[date] = (acc[date] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const churchServiceTrend = Object.entries(churchServiceByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12) // Last 12 church services

    // Total attendance
    const totalAttendance = attendance.length

    // Unique attendees
    const uniqueAttendees = new Set(attendance.map((a) => a.user.full_name)).size

    // Average attendance per event
    const eventAttendance = attendance.reduce(
      (acc, record) => {
        const eventTitle = record.event.title
        acc[eventTitle] = (acc[eventTitle] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const avgAttendancePerEvent =
      Object.keys(eventAttendance).length > 0 ? totalAttendance / Object.keys(eventAttendance).length : 0

    const avgChurchServiceAttendance =
      churchServiceTrend.length > 0
        ? Math.round((churchServiceTrend.reduce((sum, item) => sum + item.count, 0) / churchServiceTrend.length) * 10) /
          10
        : 0

    // Top events by attendance
    const topEvents = Object.entries(eventAttendance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([title, count]) => ({ title, count }))

    // Attendance by month
    const monthlyAttendance = attendance.reduce(
      (acc, record) => {
        const month = new Date(record.attended_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const monthlyData = Object.entries(monthlyAttendance)
      .map(([month, count]) => ({ month, count }))
      .slice(-6)

    // Most active members
    const memberAttendance = attendance.reduce(
      (acc, record) => {
        const name = record.user.full_name
        acc[name] = (acc[name] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topMembers = Object.entries(memberAttendance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    return {
      totalAttendance,
      uniqueAttendees,
      avgAttendancePerEvent: Math.round(avgAttendancePerEvent * 10) / 10,
      avgChurchServiceAttendance,
      churchServiceTrend,
      topEvents,
      monthlyData,
      topMembers,
    }
  }, [attendance])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAttendance}</div>
            <p className="text-xs text-muted-foreground">All time records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueAttendees}</div>
            <p className="text-xs text-muted-foreground">Different people</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg per Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgAttendancePerEvent}</div>
            <p className="text-xs text-muted-foreground">Average attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Church Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgChurchServiceAttendance}</div>
            <p className="text-xs text-muted-foreground">Sunday attendance</p>
          </CardContent>
        </Card>
      </div>

      {analytics.churchServiceTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Church Service Attendance Trend</CardTitle>
            <CardDescription>Track Sunday service attendance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Attendance",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={analytics.churchServiceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-count)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {analytics.monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Monthly attendance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Attendance",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-count)", r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {analytics.topEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Events by Attendance</CardTitle>
              <CardDescription>Most attended events</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Attendance",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={analytics.topEvents} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    dataKey="title"
                    type="category"
                    width={100}
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {analytics.topMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Most Active Members</CardTitle>
              <CardDescription>Top attendees</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Attendance",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={analytics.topMembers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
