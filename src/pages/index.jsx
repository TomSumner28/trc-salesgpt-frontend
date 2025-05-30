import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface SummaryData {
  totalEmails: number;
  topSenders: { email: string; count: number }[];
  emailsPerDay: { [date: string]: number };
}

export default function Dashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://trc-salesgpt-backend.onrender.com/emails/summary")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch summary:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-white">Loading dashboard...</div>;
  if (!data) return <div className="p-4 text-red-500">Failed to load summary data.</div>;

  const emailVolumeData = Object.entries(data.emailsPerDay).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Total Emails</p>
            <p className="text-2xl font-semibold">{data.totalEmails}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Top Senders</p>
            <ul className="text-sm mt-2 space-y-1">
              {data.topSenders.map((sender, idx) => (
                <li key={idx}>
                  {sender.email} – <strong>{sender.count}</strong>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-400 mb-2">Emails per Day</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emailVolumeData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}