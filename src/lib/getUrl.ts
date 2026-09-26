export function getYouTubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${parsedUrl.pathname.slice(1)}`;
    }

    if (
      parsedUrl.hostname === "www.youtube.com" ||
      parsedUrl.hostname === "youtube.com"
    ) {
      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      const embedMatch =
        parsedUrl.pathname.match(/^\/embed\/([^/]+)/);

      if (embedMatch) {
        return `https://www.youtube.com/embed/${embedMatch[1]}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}