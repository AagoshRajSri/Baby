from dotenv import load_dotenv

from livekit import agents
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
)
from livekit.plugins import cartesia, deepgram, groq, silero

# Option B: Gemini (Uncomment if using Gemini 1.5 Flash instead of Groq)
from livekit.plugins import google

load_dotenv()
load_dotenv(".env.local")

SYSTEM_PROMPT = (
    "You are a real-time, conversational voice OS. "
    "Respond concisely, naturally, and directly. "
    "Do NOT use markdown, emojis, asterisks, bullet points, or numbered lists, "
    "as your output will be fed directly into a text-to-speech engine."
)

server = AgentServer()


@server.rtc_session(agent_name="voice-agent")
async def entrypoint(ctx: JobContext):
    print(f"Connecting to room: {ctx.room.name}")

    # 1. Voice Activity Detection (Silero)
    vad = silero.VAD.load(
        min_speech_duration=0.05,
        min_silence_duration=0.25,  # End turn quickly for sub-500ms response
    )

    # 2. Streaming Speech-to-Text (Deepgram Nova-2)
    stt = deepgram.STT(model="nova-2", language="en")

    # 3. Fast Streaming LLM (Google Gemini)
    llm = google.LLM(model="gemini-3.6-flash")

    # 4. Ultra-low Latency Text-to-Speech (Deepgram Aura)
    tts = deepgram.TTS(
        model="aura-asteria-en"
    )

    # LiveKit 1.8 Native Agent
    agent = Agent(
        instructions=SYSTEM_PROMPT,
        vad=vad,
        stt=stt,
        llm=llm,
        tts=tts,
        allow_interruptions=True,
    )

    # Voice Session handling turn detection, interruptions, and audio streams
    session = AgentSession(
        vad=vad,
        stt=stt,
        llm=llm,
        tts=tts,
        allow_interruptions=True,
    )

    await session.start(agent, room=ctx.room)
    print("Voice agent started. Ready for audio...")

    # Initial greeting trigger
    await session.say("I'm online. What are we working on?", allow_interruptions=True)


if __name__ == "__main__":
    agents.cli.run_app(server)