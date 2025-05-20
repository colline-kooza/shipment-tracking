"use client";
import React, { useState, useRef, useEffect, JSX } from "react";

interface UploadThingVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

const UploadThingVideoPlayer: React.FC<UploadThingVideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  description = "",
  autoPlay = false,
  controls = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showThumbnail, setShowThumbnail] = useState<boolean>(
    !autoPlay && !!thumbnailUrl
  );
  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Initialize video when component mounts
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Autoplay failed:", error);
        setIsPlaying(false);
      });
    }

    // Set up fullscreen change event listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Cleanup
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [autoPlay]);

  // Handle play/pause
  const togglePlay = (): void => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current
          .play()
          .then(() => {
            setShowThumbnail(false);
          })
          .catch((error) => {
            console.error("Play failed:", error);
          });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle time update
  const handleTimeUpdate = (): void => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (videoRef.current) {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Handle mute toggle
  const toggleMute = (): void => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  // Handle metadata loaded
  const handleLoadedMetadata = (): void => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoaded(true);
    }
  };

  // Handle video click to toggle play and hide thumbnail
  const handleVideoClick = (): void => {
    setShowThumbnail(false);
    togglePlay();
  };

  // Toggle fullscreen
  const toggleFullscreen = (): void => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Format time in MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Toggle full description visibility
  const toggleDescription = (): void => {
    setShowFullDescription(!showFullDescription);
  };

  // Truncate description with "Show more" option
  const renderDescription = (): JSX.Element => {
    if (!description) return <></>;

    const MAX_LENGTH = 120;
    const needsTruncation = description.length > MAX_LENGTH;

    if (!needsTruncation) {
      return (
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {description}
        </p>
      );
    }

    return (
      <div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {showFullDescription
            ? description
            : `${description.substring(0, MAX_LENGTH)}...`}
        </p>
        <button
          onClick={toggleDescription}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
        >
          {showFullDescription ? "Show less" : "Show more"}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto my-4 bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
      {/* Header with Title and Logo */}
      {/* <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {description && (
            <p className="text-blue-100 text-sm mt-1">WeSendAll Tutorial</p>
          )}
        </div>
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-blue-300 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
            <path
              d="M2 17L12 22L22 17M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-semibold">WeSendAll</span>
        </div>
      </div> */}

      {/* Video Container */}
      <div className="relative w-full aspect-video bg-gray-900">
        {/* Thumbnail (shown before video plays) */}
        {showThumbnail && thumbnailUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center cursor-pointer z-10 flex items-center justify-center"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
            onClick={handleVideoClick}
          >
            <div className="bg-blue-600 bg-opacity-90 rounded-full p-4 transition-transform duration-300 hover:scale-110 shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          preload="metadata"
          poster={thumbnailUrl}
        />

        {/* Play/Pause Overlay (when video is loaded but not playing) */}
        {isLoaded && !isPlaying && !showThumbnail && (
          <button
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-opacity z-10"
            onClick={togglePlay}
          >
            <div className="bg-blue-600 bg-opacity-90 rounded-full p-4 transition-transform duration-300 hover:scale-110 shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Controls (only shown if controls prop is true) */}
      {controls && (
        <div className="bg-gray-100 p-3">
          {/* Progress Bar */}
          <div className="flex items-center mb-2">
            <span className="text-xs text-gray-600 mr-2 w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="relative w-full mx-2 group">
              <div className="overflow-hidden h-1.5 rounded-full bg-gray-300">
                <div
                  className="h-full bg-blue-600 transition-all duration-100"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-gray-600 ml-2 w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play/Pause Button */}
              <button
                className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg
                    className="w-5 h-5 text-gray-800"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-800"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Mute Button */}
              <button
                className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <svg
                    className="w-5 h-5 text-gray-800"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-800"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>

              {/* Volume Slider (only show on larger screens) */}
              <div className="hidden sm:flex items-center w-24">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                />
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2">
              {/* Fullscreen Button */}
              <button
                className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                }
              >
                {isFullscreen ? (
                  <svg
                    className="w-5 h-5 text-gray-800"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-800"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Description Section with visually improved style */}
      {/* {description && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">
                About this tutorial
              </h3>
              {renderDescription()}
            </div>
          </div>
        </div>
      )} */}

      {/* Footer */}
      {/* <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
        <div>WeSendAll SMS & Email Platform</div>
        <a
          href="https://www.wesendall.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <span>www.wesendall.com</span>
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div> */}
    </div>
  );
};

export default UploadThingVideoPlayer;

// Usage Example:
// <UploadThingVideoPlayer
//   videoUrl="https://uploadthing.com/f/123abc-your-video-url"
//   thumbnailUrl="https://uploadthing.com/f/456def-your-thumbnail-url"
//   title="How to Use WeSendAll SMS & Email Platform"
//   description="Learn how to manage and deliver SMS and emails to your audience with ease using the WeSendAll platform. This tutorial covers dashboard navigation, sending messages, and managing contacts."
//   autoPlay={false}
//   controls={true}
// />
