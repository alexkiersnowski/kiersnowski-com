"use client";

import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowsInIcon,
  XIcon,
  ArrowsOutIcon,
  PauseIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
} from "@phosphor-icons/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type { Media } from "@/lib/projects";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "cn";

gsap.registerPlugin(useGSAP);

type Phase = "idle" | "playing";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * play() with one muted retry: some browsers block audible playback even after a tap.
 * Any other audible video on the page (e.g. a second player, or one left behind by a dev hot
 * reload) is paused first, so two soundtracks can never overlap.
 */
function play(video: HTMLVideoElement) {
  document.querySelectorAll("video").forEach((other) => {
    if (other !== video && !other.muted && !other.paused) other.pause();
  });
  video.play().catch((error: DOMException) => {
    if (error.name !== "NotAllowedError" || video.muted) return;
    video.muted = true;
    video.play().catch(() => {});
  });
}

const controlButton =
  "flex size-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white";

/**
 * Inline click-to-play demo: poster with a cursor-following "Watch demo" pill, crossfading into
 * the video with minimal custom controls (play, scrub, time, mute, fullscreen).
 */
export function DemoPlayer({ media, sizes, className }: { media: Media; sizes: string; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const reduce = usePrefersReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [preload, setPreload] = useState<"none" | "auto">("none");
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const scrubbing = useRef(false);
  const focusInside = useRef(false);

  // Cursor-following pill (fine pointers only; touch and keyboard get a static centred pill via CSS).
  useGSAP(
    () => {
      // The pill becomes the cursor over the poster: centred on the pointer, tracking it near-instantly.
      gsap.set(pillRef.current, { xPercent: -50, yPercent: -50, scale: 0.85, autoAlpha: 0 });
    },
    { scope: frameRef },
  );

  const follow = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  function pillTo(visible: boolean) {
    gsap.to(pillRef.current, {
      scale: visible ? 1 : 0.85,
      autoAlpha: visible ? 1 : 0,
      duration: reduce ? 0 : visible ? 0.25 : 0.18,
      ease: visible ? "power3.out" : "power2.out",
      overwrite: "auto",
    });
  }

  const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onPosterEnter = (event: ReactPointerEvent) => {
    setPreload("auto");
    if (!finePointer() || phase === "playing") return;
    const rect = frameRef.current!.getBoundingClientRect();
    gsap.set(pillRef.current, { x: event.clientX - rect.left, y: event.clientY - rect.top });
    follow.current ??= {
      x: gsap.quickTo(pillRef.current, "x", { duration: reduce ? 0 : 0.12, ease: "power3.out" }),
      y: gsap.quickTo(pillRef.current, "y", { duration: reduce ? 0 : 0.12, ease: "power3.out" }),
    };
    pillTo(true);
  };

  const onPosterMove = (event: ReactPointerEvent) => {
    if (!follow.current || phase === "playing") return;
    const rect = frameRef.current!.getBoundingClientRect();
    follow.current.x(event.clientX - rect.left);
    follow.current.y(event.clientY - rect.top);
  };

  const onPosterLeave = () => pillTo(false);

  // Crossfade the poster out once the first frame is actually playing (no black flash), and back in at the end.
  useGSAP(
    () => {
      gsap.to(posterRef.current, {
        autoAlpha: phase === "playing" ? 0 : 1,
        duration: reduce ? 0 : 0.4,
        ease: "power2.inOut",
      });
    },
    { scope: frameRef, dependencies: [phase, reduce] },
  );

  const start = () => {
    const video = videoRef.current!;
    setPreload("auto");
    pillTo(false);
    play(video);
  };

  /** Stop the demo entirely and return to the hero image. */
  function close(fromKeyboard = false) {
    const video = videoRef.current!;
    video.pause();
    video.currentTime = 0;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setPhase("idle");
    setPlaying(false);
    setTime(0);
    // Keyboard users get focus back on the play button once the poster is visible again.
    if (fromKeyboard) {
      window.setTimeout(() => {
        frameRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
      }, 50);
    }
  }

  const togglePlay = useCallback(() => {
    const video = videoRef.current!;
    if (video.paused) play(video);
    else video.pause();
  }, []);

  const toggleMute = () => {
    const video = videoRef.current!;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const frame = frameRef.current!;
    const video = videoRef.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (frame.requestFullscreen) {
      frame.requestFullscreen().catch(() => {});
    } else {
      // iOS Safari only supports fullscreen on the video element itself.
      video.webkitEnterFullscreen?.();
    }
  };

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Next.js keeps visited pages mounted but hidden (React <Activity>), so a playing video would keep
  // its audio going after navigation, and play twice on return. Cleanup runs when the page is hidden.
  useLayoutEffect(() => {
    const video = videoRef.current;
    return () => {
      video?.pause();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  // Pause when scrolled mostly out of view.
  useEffect(() => {
    const frame = frameRef.current!;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !document.fullscreenElement) videoRef.current?.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // Controls: shown on activity, hidden 2s after the last interaction while playing.
  const wake = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!videoRef.current?.paused && !focusInside.current && !scrubbing.current) setControlsVisible(false);
    }, 2000);
  }, []);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  // Scrubbing with pointer capture.
  const seekFrom = (clientX: number) => {
    const track = trackRef.current!;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const video = videoRef.current!;
    if (Number.isFinite(video.duration)) {
      video.currentTime = ratio * video.duration;
      setTime(video.currentTime);
    }
  };

  const onScrubDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    scrubbing.current = true;
    seekFrom(event.clientX);
    wake();
  };

  const onScrubMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) seekFrom(event.clientX);
  };

  const onScrubUp = () => {
    scrubbing.current = false;
    wake();
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (phase !== "playing") return;
    const video = videoRef.current!;
    const key = event.key.toLowerCase();
    // Space/Enter on a focused button activates that button; don't also toggle playback.
    const onButton = (event.target as HTMLElement).closest("button") !== null;
    if ((key === " " && !onButton) || key === "k") togglePlay();
    else if (key === "arrowright") video.currentTime = Math.min(video.duration, video.currentTime + 5);
    else if (key === "arrowleft") video.currentTime = Math.max(0, video.currentTime - 5);
    else if (key === "home") video.currentTime = 0;
    else if (key === "end") video.currentTime = Math.max(0, video.duration - 0.1);
    else if (key === "m") toggleMute();
    else if (key === "f") toggleFullscreen();
    else return;
    event.preventDefault();
    wake();
  };

  const progress = duration ? (time / duration) * 100 : 0;
  const showControls = phase === "playing" && (controlsVisible || !playing);
  const label = duration ? `${formatTime(duration)}` : "";

  return (
    <div
      ref={frameRef}
      onKeyDown={onKeyDown}
      onPointerMove={phase === "playing" ? wake : undefined}
      onFocus={() => {
        focusInside.current = true;
        if (phase === "playing") setControlsVisible(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          focusInside.current = false;
          if (phase === "playing") wake();
        }
      }}
      className={cn(
        "group/demo relative overflow-clip rounded-2xl",
        fullscreen && "rounded-none bg-black",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={media.video}
        // No poster attribute: the optimised <Image> layer shows it; a raw poster would download twice.
        preload={preload}
        playsInline
        aria-label={media.alt}
        // The recording has a 1–2px dark window edge baked into its right column. Rendering the video
        // 0.25% wider, anchored left, pushes those source pixels outside the frame's clip. Cover also
        // avoids sub-pixel letterbox hairlines; fullscreen switches to contain.
        className={cn(
          "absolute top-0 left-0 h-full w-[100.25%] max-w-none object-left",
          fullscreen ? "object-contain" : "object-cover",
        )}
        onClick={
          phase === "playing"
            ? () => {
                if (finePointer()) togglePlay();
                else if (showControls) setControlsVisible(false);
                else wake();
              }
            : undefined
        }
        onPlaying={() => {
          setPhase("playing");
          setPlaying(true);
          setBuffering(false);
          wake();
        }}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onError={() => {
          setFailed(true);
          setBuffering(false);
          setPhase("idle");
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onEnded={() => {
          close(false);
        }}
        onTimeUpdate={(e) => {
          if (!scrubbing.current) setTime(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
      />

      {/* Poster layer: the whole frame is the play button until the video is running. */}
      <div ref={posterRef} className="absolute inset-0">
        <button
          type="button"
          onClick={start}
          onPointerEnter={onPosterEnter}
          onPointerMove={onPosterMove}
          onPointerLeave={onPosterLeave}
          onFocus={() => setPreload("auto")}
          aria-label={`Play demo video${label ? `, ${label}` : ""}`}
          className="group/poster absolute inset-0 size-full cursor-pointer outline-none [@media(hover:hover)_and_(pointer:fine)]:cursor-none"
        >
          {media.poster ? (
            <Image
              src={media.poster}
              alt=""
              fill
              preload
              quality={90}
              sizes={sizes}
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover/poster:scale-[1.02] group-focus-visible/poster:scale-[1.02]"
            />
          ) : null}

          {/* Static pill for touch and keyboard focus; the follower takes over on fine pointers. */}
          <span className="pointer-events-none absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm text-background [@media(hover:hover)_and_(pointer:fine)]:hidden group-focus-visible/poster:inline-flex">
            <PlayIcon weight="fill" size={14} />
            Watch demo
          </span>
        </button>

        <span
          ref={pillRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute top-0 left-0 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm whitespace-nowrap text-background opacity-0"
        >
          <PlayIcon weight="fill" size={14} />
          Watch demo
        </span>
      </div>

      {buffering && phase === "playing" ? (
        <span
          role="status"
          aria-label="Loading"
          className="pointer-events-none absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white/30 border-t-white"
        />
      ) : null}

      {failed ? (
        <p role="alert" className="absolute inset-x-0 bottom-4 text-center text-sm text-white drop-shadow">
          The demo video couldn&rsquo;t load. Please try again later.
        </p>
      ) : null}

      <button
        type="button"
        // detail === 0 means the click came from the keyboard (Enter/Space), not a pointer.
        onClick={(event) => close(event.detail === 0)}
        aria-label="Close video"
        inert={!showControls}
        className={cn(
          "absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity duration-300 hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-white sm:top-4 sm:right-4",
          showControls ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <XIcon size={16} />
      </button>

      {/* Controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-black/60 to-transparent px-3 pt-10 pb-3 transition-opacity duration-300 sm:gap-3 sm:px-4 sm:pb-4",
          showControls ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        inert={!showControls}
      >
        <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className={controlButton}>
          {playing ? <PauseIcon weight="fill" size={16} /> : <PlayIcon weight="fill" size={16} />}
        </button>

        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
          onPointerDown={onScrubDown}
          onPointerMove={onScrubMove}
          onPointerUp={onScrubUp}
          onPointerCancel={onScrubUp}
          className="group/track relative h-6 flex-1 cursor-pointer touch-none outline-none"
        >
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-white/30" />
          <span
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full bg-white"
            style={{ width: `${progress}%` }}
          />
          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white transition-transform group-hover/track:scale-100 group-focus-visible/track:scale-100"
            style={{ left: `${progress}%` }}
          />
        </div>

        <span className="shrink-0 font-mono text-xs text-white tabular-nums">
          {formatTime(time)} / {formatTime(duration)}
        </span>

        <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className={controlButton}>
          {muted ? <SpeakerSlashIcon size={16} /> : <SpeakerHighIcon size={16} />}
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          className={controlButton}
        >
          {fullscreen ? <ArrowsInIcon size={16} /> : <ArrowsOutIcon size={16} />}
        </button>
      </div>
    </div>
  );
}
