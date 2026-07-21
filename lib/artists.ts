import { Artist } from "./data/types";
import { renaissanceArtists } from "./data/artists-renaissance";
import { classicArtists } from "./data/artists-classic";
import { impressionistArtists } from "./data/artists-impressionist";
import { modernArtists } from "./data/artists-modern";
import { earlyArtists } from "./data/artists-early";
import { nineteenthCenturyArtists } from "./data/artists-19c";
import { twentiethCenturyArtists } from "./data/artists-20c";

export type { Artist, NotableWork, TimelineEvent, Palette, Artwork } from "./data/types";

/** Он цагийн дарааллаар эрэмбэлсэн бүх зураач */
export const artists: Artist[] = [
  ...renaissanceArtists,
  ...classicArtists,
  ...impressionistArtists,
  ...modernArtists,
  ...earlyArtists,
  ...nineteenthCenturyArtists,
  ...twentiethCenturyArtists,
].sort((a, b) => a.birthYear - b.birthYear);

export function getArtist(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}

export function getNotableWork(artist: Artist, workId: string) {
  return artist.notableWorks.find((w) => w.id === workId);
}
