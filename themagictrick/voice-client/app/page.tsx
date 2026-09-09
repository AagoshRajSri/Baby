"use client";

import { useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
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
  const { isMicrophoneEnabled } = useLocalParticipant();

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-6">
        <div
          className={`h-24 w-24 rounded-full transition ${
            isMicrophoneEnabled ? "animate-pulse bg-emerald-500" : "bg-red-500"
          }`}
        />

        <h1 className="text-2xl font-bold">the magic Link</h1>

        <p className="text-gray-400">
          Mic: {isMicrophoneEnabled ? "Active & Streaming" : "Muted"}
        </p>
      </div>
    </main>
  );
}
