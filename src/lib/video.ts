/** YouTube links for product videos: watch, youtu.be, Shorts, embed and live URLs, or a bare 11-character id. */
const ID = /^[A-Za-z0-9_-]{11}$/;

export function youTubeId(input: string): string | null {
  const s = input.trim();
  if (ID.test(s)) return s;
  let u: URL;
  try {
    u = new URL(s.startsWith('http') ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www|m|music)\./, '');
  let id: string | null | undefined;
  if (host === 'youtu.be') id = u.pathname.split('/')[1];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const [, first, second] = u.pathname.split('/');
    id = first === 'watch' ? u.searchParams.get('v') : ['shorts', 'embed', 'live', 'v'].includes(first) ? second : null;
  }
  return id && ID.test(id) ? id : null;
}

export const youTubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youTubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
