"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

const bookings = [
  {
    id: "b1",
    type: "flight" as const,
    title: "NRT &#8594; LAX",
    provider: "Japan Airlines",
    status: "confirmed" as const,
    price: 850,
    date: "2026-04-10",
    details: "Economy Class, 1 stop",
    trip: "Tokyo Adventure",
    confirmationId: "JAL-2847392",
  },
  {
    id: "b2",
    type: "hotel" as const,
    title: "Hotel Gracery Shinjuku",
    provider: "Booking.com",
    status: "confirmed" as const,
    price: 680,
    date: "2026-04-10",
    details: "5 nights, Standard Double",
    trip: "Tokyo Adventure",
    confirmationId: "BKG-9182736",
  },
  {
    id: "b3",
    type: "activity" as const,
    title: "teamLab Borderless Tickets",
    provider: "Viator",
    status: "pending" as const,
    price: 60,
    date: "2026-04-13",
    details: "2 adult tickets",
    trip: "Tokyo Adventure",
    confirmationId: "VTR-5739201",
  },
  {
    id: "b4",
    type: "flight" as const,
    title: "DPS &#8594; SIN",
    provider: "Singapore Airlines",
    status: "confirmed" as const,
    price: 320,
    date: "2026-05-28",
    details: "Economy, Direct",
    trip: "Bali Retreat",
    confirmationId: "SIA-4827391",
  },
];

const typeIcons: Record<string, string> = {
  flight: "M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z",
  hotel: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z",
  activity: "M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z",
};

const statusVariants: Record<string, "success" | "warning" | "danger"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "danger",
};

export default function BookingsPage() {
  const totalSpent = bookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} bookings across your trips</p>
        </div>
        <Button>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Booked</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Confirmed</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{bookings.filter((b) => b.status === "confirmed").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{bookings.filter((b) => b.status === "pending").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[booking.type]} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm" dangerouslySetInnerHTML={{ __html: booking.title }} />
                    <Badge variant={statusVariants[booking.status]}>{booking.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {booking.provider} &middot; {booking.details} &middot; {booking.trip}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Conf: {booking.confirmationId}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatCurrency(booking.price)}</p>
                  <p className="text-xs text-gray-400">{formatDate(booking.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
