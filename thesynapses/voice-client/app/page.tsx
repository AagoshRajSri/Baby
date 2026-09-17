"use client";

import { useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRemoteParticipants,
} from "@livekit/components-react";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      setError(null);

      const response = await fetch("/api/token");

      if (!response.ok) {
        throw new Error("Failed to get LiveKit token");
      }

      const data = await response.json();

      setToken(data.token);
    } catch (err) {
      console.error(err);
      setError("Could not connect to LiveKit");
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold">themagictrick</h1>

          <p className="text-gray-400">Voice connection test</p>

          <button
            onClick={connect}
            className="rounded-full bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500"
          >
            Connect Microphone
          </button>

          {error && <p className="text-red-400">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      audio={true}
      video={false}
    >
      <AudioController />

      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function AudioController() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const agent = remoteParticipants[0];

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="flex flex-col md:flex-row items-center gap-16">
        {/* Local User */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300 ${
              isMicrophoneEnabled ? "bg-emerald-900/30" : "bg-red-900/30"
            } ${localParticipant?.isSpeaking ? "scale-110 animate-pulse ring-4 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]" : ""}`}
          >
            <div
              className={`h-24 w-24 rounded-full transition-all duration-300 ${
                isMicrophoneEnabled ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">You</h2>
            <p className="text-gray-400 mt-2 font-medium">
              {localParticipant?.isSpeaking
                ? "Starts speaking..."
                : isMicrophoneEnabled
                ? "Stopped speaking"
                : "Muted"}
            </p>
          </div>
        </div>

        {/* Remote Agent */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300 ${
              agent ? "bg-blue-900/30" : "bg-gray-800/50"
            } ${agent?.isSpeaking ? "scale-110 animate-pulse ring-4 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]" : ""}`}
          >
            <div
              className={`h-24 w-24 rounded-full transition-all duration-300 ${
                agent ? "bg-blue-500" : "bg-gray-700"
              }`}
            />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Agent</h2>
            <p className="text-gray-400 mt-2 font-medium">
              {agent?.isSpeaking
                ? "Starts speaking..."
                : agent
                ? "Stopped speaking"
                : "Not connected"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
