"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import { extractYoutubeId, youtubeThumbnail, youtubeEmbedUrl } from "@/lib/youtube";

interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  description: string | null;
}

export default function VideoShowcase() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [active, setActive] = useState(0);
  const [modalVideo, setModalVideo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch active videos
  useEffect(() => {
    fetch("/api/youtube-videos")
      .then((r) => r.json())
      .then((d) => setVideos(d.videos ?? []))
      .catch(() => {});
  }, []);

  const count = videos.length;

  // Scroll to card by index
  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.children;
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const goNext = useCallback(() => {
    if (count === 0) return;
    setActive((prev) => {
      const next = (prev + 1) % count;
      scrollTo(next);
      return next;
    });
  }, [count]);

  const goPrev = useCallback(() => {
    if (count === 0) return;
    setActive((prev) => {
      const next = (prev - 1 + count) % count;
      scrollTo(next);
      return next;
    });
  }, [count]);

  // Auto-advance
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(goNext, 5000);
    return () => clearInterval(id);
  }, [count, goNext]);

  // Detect which card is centered after manual scroll
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || count === 0) return;
    const center = el.getBoundingClientRect().left + el.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const box = child.getBoundingClientRect();
      const dist = Math.abs(box.left + box.width / 2 - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActive(closest);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const pause = () => clearTimer();

  const resume = () => {
    if (count > 1 && !timerRef.current) {
      timerRef.current = setInterval(goNext, 5000);
    }
  };

  // Keep resume callback fresh
  useEffect(() => {
    if (timerRef.current) {
      // Interval was running — restart with updated goNext
      clearInterval(timerRef.current);
      timerRef.current = setInterval(goNext, 5000);
    }
  }, [goNext]);

  // ── Nothing to show ──
  if (count === 0) return null;

  return (
    <>
      <section
        className="py-20 md:py-28 bg-flag-blue overflow-hidden"
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Videos <span className="text-flag-yellow">informativos</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              Aprende m&aacute;s sobre el examen de ciudadan&iacute;a con nuestros videos seleccionados.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative">
            {/* Left arrow */}
            {count > 1 && (
              <button
                onClick={goPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors -ml-2 md:-ml-5"
                aria-label="Anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}

            {/* Right arrow */}
            {count > 1 && (
              <button
                onClick={goNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors -mr-2 md:-mr-5"
                aria-label="Siguiente"
              >
                <ChevronRight className="size-5" />
              </button>
            )}

            {/* Scrollable track */}
            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory px-2 scrollbar-hide"
            >
              {videos.map((v, i) => {
                const ytId = extractYoutubeId(v.youtubeUrl);
                const thumb = ytId ? youtubeThumbnail(ytId) : null;
                return (
                  <div
                    key={v.id}
                    className="shrink-0 w-[280px] sm:w-[340px] md:w-[400px] snap-center"
                  >
                    {/* Thumbnail card */}
                    <button
                      onClick={() => ytId && setModalVideo(ytId)}
                      className="relative w-full aspect-video rounded-xl overflow-hidden group shadow-2xl shadow-black/30 border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-flag-yellow"
                      type="button"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={v.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <span className="text-white/30 text-sm">Sin miniatura</span>
                        </div>
                      )}

                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-14 rounded-full bg-flag-red/90 flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform duration-300 group-hover:scale-110">
                          <Play className="size-6 text-white ml-1" />
                        </div>
                      </div>

                      {/* Active badge */}
                      {i === active && (
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] text-white font-medium">
                            <span className="size-1.5 rounded-full bg-flag-yellow" />
                            Viendo ahora
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Title + description */}
                    <div className="mt-3 px-1">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {v.title}
                      </h3>
                      {v.description && (
                        <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                          {v.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            {count > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {videos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActive(i);
                      scrollTo(i);
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      i === active
                        ? "w-6 h-2 bg-flag-yellow"
                        : "w-2 h-2 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Ir al video ${i + 1}`}
                    type="button"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Video Lightbox ── */}
      {modalVideo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setModalVideo(null)}
        >
          <button
            onClick={() => setModalVideo(null)}
            className="absolute top-5 right-5 size-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            aria-label="Cerrar video"
            type="button"
          >
            <X className="size-5" />
          </button>

          <div
            className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`${youtubeEmbedUrl(modalVideo)}?autoplay=1&rel=0`}
              title="YouTube video"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
