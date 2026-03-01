"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const itinerary = [
  {
    day: 1,
    title: "Arrival & Shibuya",
    activities: [
      { time: "14:00", name: "Check-in at Shinjuku Hotel", cost: 0, category: "accommodation" },
      { time: "16:00", name: "Shibuya Crossing & Hachiko Statue", cost: 0, category: "sightseeing" },
      { time: "18:00", name: "Dinner at Ichiran Ramen", cost: 15, category: "food" },
      { time: "20:00", name: "Shibuya Sky Observatory", cost: 20, category: "activity" },
    ],
  },
  {
    day: 2,
    title: "Asakusa & Akihabara",
    activities: [
      { time: "09:00", name: "Senso-ji Temple", cost: 0, category: "sightseeing" },
      { time: "11:00", name: "Nakamise Shopping Street", cost: 30, category: "activity" },
      { time: "13:00", name: "Lunch at Asakusa local spot", cost: 12, category: "food" },
      { time: "15:00", name: "Akihabara Electric Town", cost: 0, category: "sightseeing" },
      { time: "19:00", name: "Robot Restaurant show", cost: 60, category: "activity" },
    ],
  },
  {
    day: 3,
    title: "Day Trip to Mt. Fuji",
    activities: [
      { time: "07:00", name: "Bullet train to Kawaguchiko", cost: 45, category: "transport" },
      { time: "10:00", name: "Chureito Pagoda", cost: 0, category: "sightseeing" },
      { time: "12:00", name: "Lake Kawaguchi boat ride", cost: 10, category: "activity" },
      { time: "14:00", name: "Hoto noodle lunch", cost: 12, category: "food" },
      { time: "17:00", name: "Return to Tokyo", cost: 45, category: "transport" },
    ],
  },
  {
    day: 4,
    title: "Tsukiji & Ginza",
    activities: [
      { time: "06:00", name: "Tsukiji Outer Market breakfast", cost: 25, category: "food" },
      { time: "10:00", name: "teamLab Borderless", cost: 30, category: "activity" },
      { time: "13:00", name: "Sushi lunch at Ginza", cost: 40, category: "food" },
      { time: "15:00", name: "Imperial Palace East Gardens", cost: 0, category: "sightseeing" },
      { time: "18:00", name: "Ginza shopping", cost: 100, category: "activity" },
    ],
  },
  {
    day: 5,
    title: "Shinjuku & Departure",
    activities: [
      { time: "08:00", name: "Shinjuku Gyoen Garden", cost: 5, category: "sightseeing" },
      { time: "10:00", name: "Last-minute souvenir shopping", cost: 50, category: "activity" },
      { time: "12:00", name: "Check-out & head to airport", cost: 35, category: "transport" },
    ],
  },
];

const categoryColors: Record<string, string> = {
  sightseeing: "bg-purple-100 text-purple-700",
  food: "bg-orange-100 text-orange-700",
  activity: "bg-green-100 text-green-700",
  transport: "bg-blue-100 text-blue-700",
  accommodation: "bg-yellow-100 text-yellow-700",
};

export default function TripDetailPage() {
  const [activeDay, setActiveDay] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your Tripgenie AI assistant for this Tokyo trip. Ask me anything — restaurant recs, budget tips, or changes to the itinerary!" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: `Great question! For your Tokyo trip, I'd recommend checking out the local izakaya bars near Shinjuku. Budget around $20-30 per person for an authentic experience. Want me to add this to your itinerary?`,
      };
      setMessages((prev) => [...prev, { role: "assistant", content: responses.default }]);
    }, 1000);
  };

  const totalBudget = itinerary.flatMap((d) => d.activities).reduce((sum, a) => sum + a.cost, 0);
  const currentDay = itinerary.find((d) => d.day === activeDay)!;

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Tokyo Adventure</h1>
            <Badge>Planning</Badge>
          </div>
          <p className="text-gray-500 mt-1">Tokyo, Japan &middot; Apr 10-15, 2026 &middot; 2 travelers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setChatOpen(!chatOpen)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            AI Assistant
          </Button>
          <Button>Book Now</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Budget", value: formatCurrency(3000), sub: `${formatCurrency(totalBudget)} planned` },
          { label: "Duration", value: "5 Days", sub: "Apr 10-15" },
          { label: "Activities", value: `${itinerary.flatMap((d) => d.activities).length}`, sub: "across 5 days" },
          { label: "Remaining", value: formatCurrency(3000 - totalBudget), sub: "of budget" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-xl font-bold mt-1">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Itinerary */}
        <div className="flex-1 space-y-4">
          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {itinerary.map((day) => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeDay === day.day
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Day {currentDay.day}: {currentDay.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentDay.activities.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <span className="text-sm text-gray-400 font-mono w-12 flex-shrink-0 pt-0.5">{activity.time}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${categoryColors[activity.category]}`}>
                          {activity.category}
                        </span>
                        {activity.cost > 0 && (
                          <span className="text-xs text-gray-400">{formatCurrency(activity.cost)}/person</span>
                        )}
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add activity
              </button>
            </CardContent>
          </Card>
        </div>

        {/* AI Chat Panel */}
        {chatOpen && (
          <div className="w-80 flex-shrink-0">
            <Card className="flex flex-col h-[500px]">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">AI Assistant</CardTitle>
                  <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3 py-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </CardContent>
              <div className="border-t border-gray-100 p-3">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your trip..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button size="icon" type="submit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
