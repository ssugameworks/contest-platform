// No supabase imports here — client components import this file directly
// (not via ./index.ts) so they don't pull in the server-only Supabase client.
export interface Booth {
  teamId: string;
  zone: string;
  number: number;
}

export function formatBoothLocation(booth: Booth): string {
  return `${booth.zone}-${booth.number}`;
}
