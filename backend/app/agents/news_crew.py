import os
import datetime
from crewai import Agent, Crew, Process, Task, LLM # Added LLM import
from crewai.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun

class GlobalNewsCrew:
    def __init__(self):
        # Initialize the underlying search engine
        self.search_instance = DuckDuckGoSearchRun()
        
        # 1. Define the OpenRouter LLM configuration
        # This prevents the "OPENAI_API_KEY is required" error
        self.amaka_llm = LLM(
            model="openrouter/google/gemini-2.0-flash-001", # You can also use "openrouter/openai/gpt-4o"
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1",
            temperature=0.7
        )

    def run(self, topic: str) -> str:
        # 2. Define current context properly
        now = datetime.datetime.now()
        current_date_str = now.strftime("%B %d, %Y")
        
        # 3. Define the tool
        @tool("duckduckgo_search")
        def duckduckgo_search(query: str):
            """Search the internet for real-time 2026 news, sports results, and global events."""
            return self.search_instance.run(query)

        # 4. THE SCOUT
        news_scout = Agent(
            role="2026 Global News & Sports Scout",
            goal=f"Retrieve the absolute latest headlines and results as of {current_date_str}.",
            backstory=(
                f"It is currently {current_date_str}. You are a high-velocity news aggregator "
                "operating in the year 2026. You are specifically tracking Nigerian "
                "entertainment (Nollywood/Afrobeats) and the 2026 FIFA World Cup buildup."
            ),
            tools=[duckduckgo_search],
            llm=self.amaka_llm, # <--- CRITICAL: Pass the LLM here
            verbose=True,
            allow_delegation=False
        )

        # 5. THE ANALYST
        analyst = Agent(
            role="Mission Control Analyst",
            goal="Verify news accuracy and ensure timeline consistency for May 2026.",
            backstory="You are the gatekeeper of truth. You catch any hallucinations or outdated rumors.",
            llm=self.amaka_llm, # <--- CRITICAL: Pass the LLM here
            verbose=True,
            allow_delegation=False
        )

        # 6. THE WRITER
        writer = Agent(
            role="Amaka AI News Anchor",
            goal="Draft 3 high-impact social media options in valid JSON format.",
            backstory="You are a charismatic digital anchor translating raw news into viral content.",
            llm=self.amaka_llm, # <--- CRITICAL: Pass the LLM here
            verbose=True,
            allow_delegation=False
        )

        # --- TASKS ---
        fetch_task = Task(
            description=(
                f"Search the web for the latest updates on: {topic}. "
                f"Focus on events happening this week in May 2026. "
                "Look for 2026 context and ignore older data."
            ),
            expected_output="A summary of 2026-specific facts with verified sources.",
            agent=news_scout
        )

        format_task = Task(
            description=(
                "Create 3 distinct content options: 'The Breaking News', 'The Hype Train', and 'The Deep Dive'. "
                "CRITICAL: Output MUST be a single valid JSON object: "
                '{"options": [{"type": "string", "content": "string"}]}'
            ),
            expected_output="A single valid JSON object containing the 3 content options.",
            agent=writer
        )

        return Crew(
            agents=[news_scout, analyst, writer],
            tasks=[fetch_task, format_task],
            process=Process.sequential
        ).kickoff()