import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const tripRouter = router({
  list: publicProcedure.query(() => {
    // Will connect to Prisma once DB is set up
    return [
      {
        id: "1",
        title: "Tokyo Adventure",
        destination: "Tokyo, Japan",
        startDate: "2026-04-10",
        endDate: "2026-04-15",
        budget: 3000,
        currency: "USD",
        status: "planning" as const,
      },
    ];
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return {
        id: input.id,
        title: "Tokyo Adventure",
        destination: "Tokyo, Japan",
        startDate: "2026-04-10",
        endDate: "2026-04-15",
        budget: 3000,
        currency: "USD",
        status: "planning" as const,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        destination: z.string().min(1),
        startDate: z.string(),
        endDate: z.string(),
        budget: z.number().positive(),
        currency: z.string().default("USD"),
      })
    )
    .mutation(({ input }) => {
      return { id: "new-trip-id", ...input, status: "planning" as const };
    }),
});
