import os
import sys

# Mocking LiveKit room for testing
class MockRoom:
    def __init__(self):
        self.local_participant = MockParticipant()

class MockParticipant:
    async def publish_data(self, data):
        print(f"Mock published data: {data}")

def test_imports():
    print("Testing imports...")
    try:
        from livekit.agents import llm, AgentServer, AgentSession, Agent, room_io
        from livekit.plugins import google, noise_cancellation, silero
        from api import AssistantFnc
        print("Imports successful!")
        
        print("Testing AssistantFnc initialization...")
        room = MockRoom()
        fnc = AssistantFnc(room)
        print("AssistantFnc initialized successfully!")
        
        print("Testing tool discovery...")
        tools = llm.find_function_tools(fnc)
        print(f"Discovered {len(tools)} tools:")
        for t in tools:
            # We used Field(description=...) so it should be fine
            print(f" - {t}")
            
        print("Testing Assistant initialization...")
        from agent import Assistant
        assistant = Assistant()
        print("Assistant initialized successfully!")
        
    except Exception as e:
        print(f"Error during verification: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_imports()
