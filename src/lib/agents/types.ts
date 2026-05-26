export type AgentStatus = "idle" | "running" | "success" | "error";

export interface TripQuery {
  origin: string;
  destination: string;
  departDate?: string;
  returnDate?: string;
  travelers: number;
  budget?: number;
}

export interface AgentResult<T> {
  agent: string;
  status: AgentStatus;
  data?: T;
  error?: string;
  ms: number;
}

export interface WeatherDay {
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  icon: string;
  precipitation: number;
}

export interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
}

export interface DestinationInfo {
  name: string;
  country: string;
  capital: string;
  population: number;
  languages: string[];
  currency: string;
  flag: string;
  region: string;
  timezones: string[];
}

export interface DestinationPhoto {
  id: string;
  url: string;
  thumbnail: string;
  alt: string;
  photographer: string;
}

export interface TripPlan {
  weather: AgentResult<WeatherDay[]>;
  currency: AgentResult<CurrencyRate[]>;
  destination: AgentResult<DestinationInfo>;
  photos: AgentResult<DestinationPhoto[]>;
  timestamp: number;
}
