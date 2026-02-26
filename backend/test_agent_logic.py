import os
import sys
import traceback

# Ensure repository root is on sys.path so package imports work when running
# this script directly (e.g., `python backend/test_agent_logic.py`).
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)


# Mocking LiveKit room for testing
class MockRoom:
    def __init__(self):
        self.local_participant = MockParticipant()


class MockParticipant:
    async def publish_data(self, data):
        print(f"Mock published data: {data}")


def test_imports():
    print("Testing imports...")
    # Try LiveKit imports but don't fail the test if LiveKit isn't available.
    try:
        from livekit.agents import llm, AgentSession, Agent
        from livekit.plugins import google, noise_cancellation, silero
        print("LiveKit imports available")
    except Exception as e:
        print("LiveKit imports not available, skipping LiveKit-specific checks:", e)
        llm = None

    try:
        # Import backend modules using package imports so this works when run
        # both as a script and as part of a test runner.
        from backend.api import AssistantFnc
        from backend.agent import Assistant
        print("Backend imports successful!")

        print("Testing AssistantFnc initialization...")
        room = MockRoom()
        fnc = AssistantFnc(room)
        print("AssistantFnc initialized successfully!")

        if llm is not None:
            print("Testing tool discovery...")
            tools = llm.find_function_tools(fnc)
            print(f"Discovered {len(tools)} tools:")
            for t in tools:
                print(f" - {t}")

        print("Testing Assistant initialization...")
        assistant = Assistant()
        print("Assistant initialized successfully!")

    except Exception as e:
        print(f"Error during verification: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    test_imports()
