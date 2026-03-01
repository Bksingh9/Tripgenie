"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const destinations = [
  { id: "1", name: "Tokyo, Japan", tagline: "Where tradition meets future", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop", avgBudget: 2800, bestSeason: "Spring", tags: ["culture", "food", "nightlife"] },
  { id: "2", name: "Bali, Indonesia", tagline: "Island of the gods", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop", avgBudget: 1500, bestSeason: "Apr-Oct", tags: ["beach", "wellness", "nature"] },
  { id: "3", name: "Paris, France", tagline: "The City of Light", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop", avgBudget: 3500, bestSeason: "Apr-Jun", tags: ["romance", "art", "food"] },
  { id: "4", name: "Santorini, Greece", tagline: "Sunsets over the Aegean", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop", avgBudget: 2200, bestSeason: "May-Sep", tags: ["beach", "romance", "photography"] },
  { id: "5", name: "New York, USA", tagline: "The city that never sleeps", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop", avgBudget: 4000, bestSeason: "Sep-Nov", tags: ["nightlife", "culture", "food"] },
  { id: "6", name: "Machu Picchu, Peru", tagline: "Lost city of the Incas", image: "https://images.unsplash.com/photo-1587595431973-160d0d163e01?w=400&h=300&fit=crop", avgBudget: 1800, bestSeason: "May-Sep", tags: ["adventure", "history", "nature"] },
];

const categories = ["All", "Beach", "Culture", "Adventure", "Food", "Romance", "Nature"];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = destinations.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || d.tags.some((t) => t.toLowerCase() === activeCategory.toLowerCase());
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explore Destinations</h1>
        <p className="text-gray-500 text-sm mt-1">Discover your next adventure</p>
      </div>

      {/* AI Recommendation Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Let AI pick your destination</h3>
              <p className="text-blue-100 text-sm mt-1">Tell us your vibe, budget, and dates — we&apos;ll find the perfect match.</p>
              <div className="flex gap-2 mt-4">
                <input
                  className="flex-1 max-w-md rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-sm placeholder:text-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="e.g., Relaxing beach trip for 2, under $2000"
                />
                <Button className="bg-white text-blue-600 hover:bg-blue-50">Find Destinations</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            className="pl-10"
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((dest) => (
          <Card key={dest.id} className="overflow-hidden hover:shadow-lg transition cursor-pointer group">
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <h3 className="font-bold text-lg">{dest.name}</h3>
                <p className="text-white/80 text-sm">{dest.tagline}</p>
              </div>
            </div>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {dest.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs capitalize">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-gray-500">Best: {dest.bestSeason}</span>
                <span className="font-semibold">From ${dest.avgBudget.toLocaleString()}</span>
              </div>
              <Button className="w-full mt-3" variant="outline" size="sm">
                Plan This Trip
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
