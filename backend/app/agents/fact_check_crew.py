from crewai import Agent, Task, Crew, LLM
from crewai_tools import SerperDevTool
from app.core.config import settings

class FactCheckCrew:
    def __init__(self):
        # Initialize Serper - it reads settings.SERPER_API_KEY automatically
        self.search_tool = SerperDevTool(
            n_results=5,
            location="Nigeria", # Helps prioritize local context
            save_file=False
        )
        
        self.llm = LLM(
            model="openai/gpt-5.5",
            api_key=settings.OPENROUTER_API_KEY,
            base_url=settings.base_url
        )

        # self.llm = LLM(
        #     model="openai/gpt-5.5", 
        #     temperature=0.7,
        #     api_key=settings.OPENAI_API_KEY
        # )

    def verify_claim(self, claim: str):
        # The Skeptical Researcher
        checker = Agent(
            role="Nigerian Media Fact-Checker",
            goal=f"Determine if the claim '{claim}' is True, False, or Misleading based on live news.",
            backstory="""You are a veteran journalist in Lagos. You know which sources are 
            reliable and which are propaganda. You never take a single tweet as proof.""",
            tools=[self.search_tool],
            llm=self.llm,
            verbose=True
        )

        check_task = Task(
            description=f"""Search the live web for: '{claim}'. 
            Compare reports from at least 3 distinct Nigerian news outlets. 
            Check for official government gazettes if applicable.""",
            # We enforce JSON output so the backend can easily parse it for the DB
            expected_output="""A JSON object: {
                "verdict": "True" | "False" | "Misleading",
                "summary": "2-sentence explanation",
                "sources": ["url1", "url2"]
            }""",
            agent=checker
        )

        crew = Crew(agents=[checker], tasks=[check_task])
        result = crew.kickoff()
        
        # CrewAI returns a CrewOutput object; we extract the raw JSON string
        return result.raw