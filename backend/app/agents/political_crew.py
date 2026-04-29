# 1. Change your imports to include the LLM class from crewai
from crewai import Agent, Task, Crew, Process, LLM 
from app.core.config import settings

class PoliticalInfluencerCrew:
    def __init__(self):
        # 2. Use the CrewAI LLM wrapper instead of ChatOpenAI
        self.agent_llm = LLM(
            model="openai/meta-llama/llama-3.1-70b-instruct", # prefix with 'openai/' for openrouter
            base_url=settings.base_url,
            api_key=settings.OPENROUTER_API_KEY,
            temperature=0.7
        )

    def _create_agents(self):
        researcher = Agent(
            role="Political Researcher",
            goal="Identify the latest updates regarding {topic} in Nigeria.",
            backstory="Investigative journalist specializing in Nigerian social-political dynamics.",
            llm=self.agent_llm, # Pass the new wrapper here
            verbose=True,
            allow_delegation=False
        )

        influencer = Agent(
            role="Digital Content Strategist",
            goal=f"Draft a compelling social media post in the voice of {settings.INFLUENCER_NAME}.",
            backstory=f"{settings.INFLUENCER_BIO}. You are known for bridging the gap between street vibes and policy.",
            llm=self.agent_llm, # Pass the new wrapper here
            verbose=True
        )

        return researcher, influencer

    def run(self, topic: str):
        researcher, influencer = self._create_agents()
        
        t1 = Task(
            description=f"Summarize the recent controversy or news involving {topic}.", 
            expected_output="A concise summary of the key facts.",
            agent=researcher
        )
        
        t2 = Task(
            description="Write a viral thread for X (Twitter) based on the research. Mix English and Pidgin.", 
            expected_output="A 3-part Twitter thread.",
            agent=influencer
        )

        crew = Crew(
            agents=[researcher, influencer],
            tasks=[t1, t2],
            process=Process.sequential
        )
        
        # Convert the CrewOutput object to string for the DB
        result = crew.kickoff()
        return str(result)