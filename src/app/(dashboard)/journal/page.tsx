"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const entries = [
  {
    id: "j1",
    title: "Golden hour at Senso-ji",
    content: "Arrived at Senso-ji temple just as the sun was setting. The golden light hitting the five-story pagoda was absolutely magical. The incense smoke drifting through the evening air created this ethereal atmosphere that photos simply can't capture. We spent two hours just wandering and soaking it all in.",
    location: "Asakusa, Tokyo",
    date: "2026-04-11",
    photos: [
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&h=200&fit=crop",
    ],
    visibility: "public" as const,
    trip: "Tokyo Adventure",
    likes: 24,
  },
  {
    id: "j2",
    title: "Best ramen of my life",
    content: "Found a tiny ramen shop in a Shinjuku back alley with only 8 seats. The broth was simmered for 18 hours — rich, creamy tonkotsu that was perfection in a bowl. The chashu melted on my tongue. No English menu, but the old man running it was incredibly kind. This is why we travel.",
    location: "Shinjuku, Tokyo",
    date: "2026-04-12",
    photos: [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop",
    ],
    visibility: "public" as const,
    trip: "Tokyo Adventure",
    likes: 18,
  },
  {
    id: "j3",
    title: "Mt. Fuji through the clouds",
    content: "Took the early bullet train to Kawaguchiko. When we arrived, Fuji was completely hidden behind clouds. We almost gave up — but then around noon, the clouds parted for just 20 minutes. That first glimpse of the snow-capped peak was worth the entire trip. Sometimes patience is the best travel skill.",
    location: "Kawaguchiko, Japan",
    date: "2026-04-13",
    photos: [
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=300&h=200&fit=crop",
    ],
    visibility: "private" as const,
    trip: "Tokyo Adventure",
    likes: 0,
  },
];

export default function JournalPage() {
  const [view, setView] = useState<"grid" | "list">("list");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Travel Journal</h1>
          <p className="text-gray-500 text-sm mt-1">Document your adventures and share your stories</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-sm ${view === "list" ? "bg-gray-100 text-gray-900" : "text-gray-500"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </button>
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 text-sm ${view === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-500"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
          </div>
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            New Entry
          </Button>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-6">
        {entries.map((entry) => (
          <Card key={entry.id} className="overflow-hidden hover:shadow-md transition">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <Avatar fallback="U" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Demo User</span>
                    <span className="text-xs text-gray-400">&middot;</span>
                    <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    <Badge variant={entry.visibility === "public" ? "default" : "outline"} className="ml-auto">
                      {entry.visibility === "public" ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{entry.location} &middot; {entry.trip}</p>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{entry.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{entry.content}</p>

              {/* Photos */}
              {entry.photos.length > 0 && (
                <div className={`mt-4 grid gap-2 ${entry.photos.length === 1 ? "grid-cols-1" : entry.photos.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {entry.photos.map((photo, i) => (
                    <div key={i} className="rounded-lg overflow-hidden bg-gray-100">
                      <img src={photo} alt="" className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  {entry.likes > 0 ? entry.likes : "Like"}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  Share
                </button>
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition ml-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
