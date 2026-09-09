from dotenv import load_dotenv

from livekit import agents
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    TurnHandlingOptions,
    UserStateChangedEvent,
)

from livekit.plugins import silero


# Load LiveKit credentials from voice-agent/.env.localPy
load_dotenv(".env.local")


server = AgentServer()


@server.rtc_session(agent_name="voice-agent")
async def entrypoint(ctx: JobContext):

    print(f"Connecting to room: {ctx.room.name}")

    # Load Silero VAD
    vad = silero.VAD.load(
        min_silence_duration=0.25,
        prefix_padding_duration=0.5,
    )

    # Create the voice session
    session = AgentSession(
        vad=vad,
        turn_handling=TurnHandlingOptions(
            turn_detection="vad",
        ),
    )

    # Listen for VAD-driven user state changes
    @session.on("user_state_changed")
    def on_user_state_changed(event: UserStateChangedEvent):

        if event.new_state == "speaking":
            print(">>> [VAD] User started speaking")

        elif event.new_state == "listening":
            print("<<< [VAD] User stopped speaking")

        elif event.new_state == "away":
            print("[VAD] User is away")

    # Start the session
    await session.start(
        room=ctx.room,
        agent=Agent(
            instructions="You are a silent voice activity detection agent."
        ),
    )

    print("Agent connected. Waiting for microphone audio...")


if __name__ == "__main__":
    agents.cli.run_app(server)