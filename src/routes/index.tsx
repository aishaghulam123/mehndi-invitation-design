import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "@/components/bazaar/Experience";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bazaar After Dark — Zara & Rayyan's Mehndi Night" },
      { name: "description", content: "Step into a lantern-lit Lahore bazaar and discover Zara Ahmed & Rayyan Malik's Mehndi Night invitation — 21 November 2026." },
      { property: "og:title", content: "Bazaar After Dark — A Mehndi Night Invitation" },
      { property: "og:description", content: "Tonight, the bazaar belongs to love. Zara & Rayyan, The Lantern Courtyard, Lahore." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Experience,
});
