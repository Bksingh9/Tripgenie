import { router } from "../trpc";
import { tripRouter } from "./trip";

export const appRouter = router({
  trip: tripRouter,
});

export type AppRouter = typeof appRouter;
