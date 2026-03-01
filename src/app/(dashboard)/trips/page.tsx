"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

type TripStatus = "planning" | "booked" | "in-progress" | "completed";

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TripStatus;
  image: string;
  activities: number;
}

const statusColors: Record<TripStatus, "default" | "success" | "warning" | "danger"> = {
  planning: "default",
  booked: "success",
  "in-progress": "warning",
  completed: "outline" as never,
};

const demoTrips: Trip[] = [
  {
    id: "1",
    title: "Tokyo Adventure",
    destination: "Tokyo, Japan",
    startDate: "2026-04-10",
    endDate: "2026-04-15",
    budget: 3000,
    status: "planning",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop",
    activities: 12,
  },
  {
    id: "2",
    title: "Bali Retreat",
    destination: "Bali, Indonesia",
    startDate: "2026-05-20",
    endDate: "2026-05-28",
    budget: 2500,
    status: "booked",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=250&fit=crop",
    activities: 8,
  },
  {
    id: "3",
    title: "Paris Getaway",
    destination: "Paris, France",
    startDate: "2026-02-01",
    endDate: "2026-02-05",
    budget: 4000,
    status: "completed",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop",
    activities: 15,
  },
];

export default function TripsPage() {
  const [trips] = useState<Trip[]>(demoTrips);
  const [showNewTrip, setShowNewTrip] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-gray-500 text-sm mt-1">{trips.length} trips planned</p>
        </div>
        <Button onClick={() => setShowNewTrip(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Trip
        </Button>
      </div>

      {/* New Trip Dialog (inline) */}
      {showNewTrip && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Plan a new trip with AI</h3>
              <div className="flex gap-3">
                <input
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Where do you want to go? Try: '5 days in Tokyo, budget $3000'"
                />
                <Button>Generate Itinerary</Button>
              </div>
              <div className="flex gap-2">
                {["Weekend in NYC", "Beach vacation Bali", "European road trip", "Safari in Kenya"].map((s) => (
                  <button
                    key={s}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowNewTrip(false)} className="text-sm text-gray-400 hover:text-gray-600">
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <Link key={trip.id} href={`/trips/${trip.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer group">
              <div className="relative h-40 bg-gray-200 overflow-hidden">
                <img
                  src={trip.image}
                  alt={trip.destination}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant={statusColors[trip.status] || "outline"}>
                    {trip.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
              <CardContent className="pt-4 pb-5">
                <h3 className="font-semibold text-lg">{trip.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{trip.destination}</p>
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(trip.budget)}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  <span>{trip.activities} activities</span>
                  <span>&#8226;</span>
                  <span>{Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000)} days</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
