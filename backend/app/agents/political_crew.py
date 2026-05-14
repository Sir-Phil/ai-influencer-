from crewai import Agent, Task, Crew, Process, LLM 
from app.core.config import settings

class PoliticalInfluencerCrew:
    def __init__(self):
        self.agent_llm = LLM(
            model="openai/gpt-4o", 
            api_key=settings.OPENROUTER_API_KEY,
            base_url=settings.base_url,
            temperature=0.8
        )

    def _create_agents(self):
        researcher = Agent(
            role="Political Researcher",
            goal="Identify facts regarding {topic} in Nigeria, specifically Rivers State.",
            backstory="Investigative journalist specializing in Nigerian social-political dynamics.",
            llm=self.agent_llm,
            verbose=True
        )

        influencer = Agent(
            role="Digital Content Strategist",
            goal=f"Draft three distinct post options for {settings.INFLUENCER_NAME}.",
            backstory=f"{settings.INFLUENCER_BIO}. Expert in policy, street vibes, and digital activism.",
            llm=self.agent_llm,
            verbose=True
        )
        return researcher, influencer

    def run(self, topic: str):
        researcher, influencer = self._create_agents()
        
        t1 = Task(
            description=f"Summarize the recent facts involving {topic}.", 
            expected_output="A concise summary of the key facts.",
            agent=researcher
        )
        
        t2 = Task(
            description="Create 3 distinct post options: 1. The Advocate (Formal), 2. The PH Local (Pidgin/Slang), 3. The Firebrand (Punchy).", 
            expected_output="""A JSON object ONLY. No markdown blocks. 
            Structure: {"options": [{"type": "The Advocate", "content": "..."}, {"type": "The PH Local", "content": "..."}, {"type": "The Firebrand", "content": "..."}]}""",
            agent=influencer
        )

        crew = Crew(agents=[researcher, influencer], tasks=[t1, t2], process=Process.sequential)
        return str(crew.kickoff())