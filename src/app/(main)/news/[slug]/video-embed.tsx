"use client";

interface VideoEmbedProps {
  url: string;
  title: string;
}

function extractVideoInfo(url: string): { platform: string; id: string } | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch) {
    return { platform: "youtube", id: ytMatch[1] };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { platform: "vimeo", id: vimeoMatch[1] };
  }

  // Bilibili
  const biliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
  if (biliMatch) {
    return { platform: "bilibili", id: biliMatch[1] };
  }

  return null;
}

export function VideoEmbed({ url, title }: VideoEmbedProps) {
  const videoInfo = extractVideoInfo(url);

  if (!videoInfo) {
    // Fallback to direct link
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Watch Video
        </a>
      </div>
    );
  }

  const embedUrl = {
    youtube: `https://www.youtube.com/embed/${videoInfo.id}`,
    vimeo: `https://player.vimeo.com/video/${videoInfo.id}`,
    bilibili: `https://player.bilibili.com/player.html?bvid=${videoInfo.id}`,
  }[videoInfo.platform];

  return (
    <div className="aspect-video rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
