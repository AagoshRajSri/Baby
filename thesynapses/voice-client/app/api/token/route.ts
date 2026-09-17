import { AccessToken } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const roomName = "themagictrick-live";
    const identity = `user-${crypto.randomUUID()}`;

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit credentials are not configured" },
        { status: 500 },
      );
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: "10m",
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    // Explicitly dispatch our Python voice agent
    token.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: "voice-agent",
        }),
      ],
    });

    return NextResponse.json({
      token: await token.toJwt(),
      roomName,
    });
  } catch (error) {
    console.error("Token generation failed:", error);

    return NextResponse.json(
      { error: "Failed to generate LiveKit token" },
      { status: 500 },
    );
  }
}
