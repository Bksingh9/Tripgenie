import type { TripQuery, AgentResult, DestinationPhoto } from "./types";

export async function runPhotoAgent(query: TripQuery): Promise<AgentResult<DestinationPhoto[]>> {
  const start = performance.now();

  // Curated Unsplash photos for popular Indian destinations
  const photoDb: Record<string, DestinationPhoto[]> = {
    goa: [
      { id: "g1", url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", thumbnail: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400", alt: "Goa beach sunset", photographer: "Unsplash" },
      { id: "g2", url: "https://images.unsplash.com/photo-1587922546307-776227941871?w=800", thumbnail: "https://images.unsplash.com/photo-1587922546307-776227941871?w=400", alt: "Goa church", photographer: "Unsplash" },
      { id: "g3", url: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800", thumbnail: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=400", alt: "Goa palm trees", photographer: "Unsplash" },
    ],
    manali: [
      { id: "m1", url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", thumbnail: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400", alt: "Manali mountains", photographer: "Unsplash" },
      { id: "m2", url: "https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?w=800", thumbnail: "https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?w=400", alt: "Manali valley", photographer: "Unsplash" },
    ],
    jaipur: [
      { id: "j1", url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800", thumbnail: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400", alt: "Jaipur palace", photographer: "Unsplash" },
      { id: "j2", url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800", thumbnail: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400", alt: "Hawa Mahal", photographer: "Unsplash" },
    ],
    kerala: [
      { id: "k1", url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", thumbnail: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400", alt: "Kerala backwaters", photographer: "Unsplash" },
      { id: "k2", url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800", thumbnail: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400", alt: "Kerala houseboat", photographer: "Unsplash" },
    ],
    delhi: [
      { id: "d1", url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800", thumbnail: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400", alt: "India Gate Delhi", photographer: "Unsplash" },
    ],
    mumbai: [
      { id: "mu1", url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800", thumbnail: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400", alt: "Gateway of India", photographer: "Unsplash" },
    ],
  };

  const dest = query.destination.toLowerCase();
  const photos = photoDb[dest];

  if (photos) {
    return { agent: "Photos", status: "success", data: photos, ms: performance.now() - start };
  }

  // Fallback: generic travel photo
  return {
    agent: "Photos",
    status: "success",
    data: [
      { id: "generic", url: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800`, thumbnail: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400`, alt: `${query.destination} travel`, photographer: "Unsplash" },
    ],
    ms: performance.now() - start,
  };
}
