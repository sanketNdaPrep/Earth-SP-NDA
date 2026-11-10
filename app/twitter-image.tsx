import { ShareImage, size, contentType } from "@/lib/share-image";

export const alt = "EARTH SP NDA - Practice Tests & Notes";
export { size, contentType };

export default function Image() {
  return ShareImage({
    title: "EARTH SP NDA - Tactical Defence Prep",
    description: "Practice tests, study trackers, and performance analytics for NDA aspirants.",
  });
}