"use client";

import React, { useEffect, useState } from "react";

type MessageStatus = "sending" | "sent";

interface Message {
  id: number;
  text: string;
  status: MessageStatus;
}

export default function Loading(): React.ReactElement {
  const [progress, setProgress] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);

  const messageTexts: string[] = [
    "Connecting to servers...",
    "Loading freight inventory...",
    "Syncing cargo data...",
    "Preparing logistics dashboard...",
    "Almost there...",
  ];

  useEffect(() => {
    const progressTimer: NodeJS.Timeout = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 0.5;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 50);

    // Add messages one by one
    const messageTimer: NodeJS.Timeout = setInterval(() => {
      setMessages((prev) => {
        if (prev.length >= messageTexts.length) return prev;
        return [
          ...prev,
          {
            id: prev.length,
            text: messageTexts[prev.length],
            status: "sending",
          },
        ];
      });
    }, 1200);

    // Update message status to 'sent'
    const statusTimer: NodeJS.Timeout = setInterval(() => {
      setMessages((prev) =>
        prev.map((msg, index) => {
          if (index === prev.length - 2 && msg.status === "sending") {
            return { ...msg, status: "sent" };
          }
          return msg;
        })
      );
    }, 800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
      clearInterval(statusTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center justify-center">
        {/* Background reveal animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 reveal-bg"></div>

        {/* Logo container */}
        <div className="relative h-24 mb-8 z-10">
          {/* Background glow effect */}
          <div className="absolute w-48 h-48 rounded-full bg-blue-400/10 dark:bg-blue-600/20 blur-xl -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 glow-effect"></div>

          {/* Truck messages animation */}
          <div className="truck-container absolute w-full h-32 overflow-hidden pointer-events-none">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`truck-message ${message.status} absolute p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2 transform`}
                style={{
                  top: `${20 + index * 5}%`,
                  left: message.status === "sending" ? "10%" : "90%",
                  opacity: message.status === "sending" ? 1 : 0,
                  transform:
                    message.status === "sending"
                      ? "translateX(0) scale(1)"
                      : "translateX(50px) scale(0.8)",
                  transition: "all 0.6s ease-in-out",
                  zIndex: 10 - index,
                }}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                {message.text}
              </div>
            ))}
          </div>

          {/* Road path with dashed line animation */}
          <svg
            width="220"
            height="96"
            viewBox="0 0 220 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute"
          >
            <path
              d="M10,72 C60,72 160,72 210,72"
              stroke="currentColor"
              strokeOpacity="0.5"
              strokeWidth="4"
              strokeDasharray="8 8"
              className="text-slate-400 dark:text-slate-600 path-dash"
            />
          </svg>

          {/* Truck Animation with trail effect */}
          <div className="truck absolute">
            <div className="truck-trail absolute w-12 h-4 rounded-full"></div>
            <svg
              width="40"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="truck-bounce"
            >
              <path
                d="M16 3H1V16H16V3Z"
                fill="currentColor"
                fillOpacity="0.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600 dark:text-blue-400"
              />
              <path
                d="M16 8H20L23 12V16H16V8Z"
                fill="currentColor"
                fillOpacity="0.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600 dark:text-blue-400"
              />
              <circle
                cx="5.5"
                cy="18.5"
                r="2.5"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
                className="text-blue-600 dark:text-blue-400 wheel"
              />
              <circle
                cx="18.5"
                cy="18.5"
                r="2.5"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
                className="text-blue-600 dark:text-blue-400 wheel"
              />
            </svg>
          </div>

          {/* Text Logo with reveal animation */}
          <div className="logo-text font-bold tracking-tight text-4xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap flex items-center">
            <div className="logo-reveal-mask overflow-hidden">
              <span
                className="text-blue-600 dark:text-blue-400 letter-animate"
                style={{ animationDelay: "0.0s" }}
              >
                T
              </span>
            </div>
            <div className="logo-reveal-mask overflow-hidden">
              <span
                className="text-blue-600 dark:text-blue-400 letter-animate"
                style={{ animationDelay: "0.05s" }}
              >
                R
              </span>
            </div>
            <div className="logo-reveal-mask overflow-hidden">
              <span
                className="text-blue-600 dark:text-blue-400 letter-animate"
                style={{ animationDelay: "0.1s" }}
              >
                A
              </span>
            </div>
            <div className="logo-reveal-mask overflow-hidden">
              <span
                className="text-blue-600 dark:text-blue-400 letter-animate"
                style={{ animationDelay: "0.15s" }}
              >
                K
              </span>
            </div>
            <div className="logo-reveal-mask overflow-hidden">
              <span
                className="text-blue-600 dark:text-blue-400 letter-animate"
                style={{ animationDelay: "0.2s" }}
              >
                I
              </span>
            </div>
            <div
              className="logo-reveal-mask overflow-hidden"
              style={{ margin: "0 -1px" }}
            >
              <span
                className="inline-block transform truck-pulse letter-animate"
                style={{ animationDelay: "0.25s" }}
              >
                <svg
                  width="32"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative top-[-1px]"
                >
                  <path
                    d="M16 3H1V16H16V3Z"
                    fill="currentColor"
                    fillOpacity="0.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <path
                    d="M16 8H20L23 12V16H16V8Z"
                    fill="currentColor"
                    fillOpacity="0.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <circle
                    cx="5.5"
                    cy="18.5"
                    r="2.5"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <circle
                    cx="18.5"
                    cy="18.5"
                    r="2.5"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-blue-600 dark:text-blue-400"
                  />
                </svg>
              </span>
            </div>
            <div className="logo-reveal-mask overflow-hidden">
              <span
                className="text-blue-600 dark:text-blue-400 letter-animate"
                style={{ animationDelay: "0.3s" }}
              >
                T
              </span>
            </div>
            <div className="logo-reveal-mask overflow-hidden">
              <span
                className="text-blue-600 dark:text-blue-400 letter-animate"
                style={{ animationDelay: "0.35s" }}
              >
                I
              </span>
            </div>
          
          </div>
        </div>

        {/* Loading Text with dot animation */}
        <div className="text-sm text-slate-600 dark:text-slate-300 tracking-wider loading-text flex items-center z-10">
          <span>LOADING</span>
          <span className="loading-dots ml-1">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </div>

        {/* Status message that changes with progress */}
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2 h-4 opacity-80 status-message z-10">
          {messages.length > 0 && messages[messages.length - 1].text}
        </div>

        {/* Enhanced Loading Bar with progress */}
        <div className="mt-2 w-48 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner z-10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-500 loading-progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        .reveal-bg {
          clip-path: circle(0% at 50% 50%);
          animation: revealBg 2s ease-out forwards;
        }

        .logo-reveal-mask {
          transform: translateY(100%);
          animation: revealLetter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .logo-reveal-mask:nth-child(1) {
          animation-delay: 0.1s;
        }
        .logo-reveal-mask:nth-child(2) {
          animation-delay: 0.2s;
        }
        .logo-reveal-mask:nth-child(3) {
          animation-delay: 0.3s;
        }
        .logo-reveal-mask:nth-child(4) {
          animation-delay: 0.4s;
        }
        .logo-reveal-mask:nth-child(5) {
          animation-delay: 0.5s;
        }
        .logo-reveal-mask:nth-child(6) {
          animation-delay: 0.6s;
        }
        .logo-reveal-mask:nth-child(7) {
          animation-delay: 0.65s;
        }
        .logo-reveal-mask:nth-child(8) {
          animation-delay: 0.7s;
        }
        .logo-reveal-mask:nth-child(9) {
          animation-delay: 0.75s;
        }
        .logo-reveal-mask:nth-child(10) {
          animation-delay: 0.8s;
        }

        .truck-container {
          perspective: 1000px;
        }

        .truck-message {
          transition: all 0.6s ease-in-out;
          min-width: 140px;
        }

        .truck-message.sending {
          animation: floatSending 1s ease-in-out infinite alternate;
        }

        .glow-effect {
          animation: pulse-glow 3s infinite;
        }

        .path-dash {
          stroke-dashoffset: 0;
          animation: dash-animation 15s linear infinite;
        }

        .truck {
          animation: truckDrive 5s linear infinite;
          opacity: 1;
          top: 60px;
        }

        .truck-trail {
          background: linear-gradient(
            90deg,
            rgba(34, 197, 94, 0),
            rgba(34, 197, 94, 0.2)
          );
          filter: blur(4px);
          transform: translateX(-100%);
          animation: trail 5s linear infinite;
        }

        .truck-bounce {
          animation: truckBounce 0.5s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 5px rgba(34, 197, 94, 0.5));
        }

        .wheel {
          animation: wheelSpin 1s linear infinite;
          transform-origin: center;
        }

        .letter-animate {
          display: inline-block;
          animation: letterPulse 2s ease-in-out infinite;
        }

        .truck-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .loading-text {
          animation: fadeInOut 2s infinite;
        }

        .status-message {
          animation: fadeIn 0.5s ease-in-out;
        }

        .loading-dots .dot {
          opacity: 0;
          animation: dotFade 1.5s infinite;
        }

        .loading-dots .dot:nth-child(1) {
          animation-delay: 0s;
        }

        .loading-dots .dot:nth-child(2) {
          animation-delay: 0.5s;
        }

        .loading-dots .dot:nth-child(3) {
          animation-delay: 1s;
        }

        .loading-progress {
          position: relative;
          transition: width 0.2s ease;
        }

        .loading-progress::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        @keyframes revealBg {
          0% {
            clip-path: circle(0% at 50% 50%);
          }
          100% {
            clip-path: circle(150% at 50% 50%);
          }
        }

        @keyframes revealLetter {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes floatSending {
          0% {
            transform: translateY(0) rotate(-1deg);
          }
          100% {
            transform: translateY(-5px) rotate(1deg);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes dash-animation {
          to {
            stroke-dashoffset: 80;
          }
        }

        @keyframes truckDrive {
          0% {
            transform: translateX(-100px);
          }
          100% {
            transform: translateX(220px);
          }
        }

        @keyframes trail {
          0% {
            transform: translateX(-80%);
            opacity: 0;
          }
          20% {
            opacity: 0.4;
          }
          80% {
            opacity: 0.2;
          }
          100% {
            transform: translateX(-10%);
            opacity: 0;
          }
        }

        @keyframes truckBounce {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-2px);
          }
        }

        @keyframes wheelSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes letterPulse {
          0%,
          100% {
            transform: translateY(0);
            filter: brightness(1);
          }
          50% {
            transform: translateY(-2px);
            filter: brightness(1.2) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.1));
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.2) rotate(0deg);
            filter: brightness(1.3) drop-shadow(0 0 5px rgba(34, 197, 94, 0.6));
          }
        }

        @keyframes fadeInOut {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 0.8;
          }
        }

        @keyframes dotFade {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(150%);
          }
        }
      `}</style>
    </div>
  );
}
