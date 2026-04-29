from crewai import Agent, Task, Crew, LLM
from crewai_tools import SerperDevTool
from app.core.config import settings

class FactCheckCrew:
    def __init__(self):
        # Initialize the search tool
        self.search_tool = SerperDevTool()
        
        # Using the same OpenRouter LLM setup
        self.llm = LLM(
            model="openrouter/meta-llama/llama-3.1-70b-instruct",
            api_key=settings.OPENROUTER_API_KEY,
            base_url=settings.base_url
        )

    def verify_claim(self, claim: str):
        # 1. The Fact-Checker Agent
        checker = Agent(
            role="Lead Fact-Checker",
            goal=f"Verify the accuracy of the claim: {claim}",
            backstory="""You are an expert analyst at a top Nigerian fact-checking organization. 
            You are skeptical, thorough, and look for primary sources like official government 
            statements, reputable news outlets (Premium Times, Punch, etc.), and verified data.""",
            tools=[self.search_tool],
            llm=self.llm,
            verbose=True
        )

        # 2. The Verification Task
        check_task = Task(
            description=f"""Search for the latest information regarding: '{claim}'.
            Compare multiple sources. Identify if the claim is 'True', 'False', or 'Misleading'.
            Provide a brief explanation and the links used for verification.""",
            expected_output="""A JSON object containing:
            - verdict: (True/False/Misleading)
            - summary: (A 2-sentence explanation)
            - sources: (List of URLs)""",
            agent=checker
        )

        crew = Crew(agents=[checker], tasks=[check_task])
        return crew.kickoff()