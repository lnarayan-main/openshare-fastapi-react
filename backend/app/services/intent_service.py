from app.services.ollama_service import ollama_service
from app.core.config import settings


class IntentService:
    @staticmethod
    def classify(query: str) -> str:
        """
        Classifies the user query.
        Returns 'RETRIEVAL' if we need to search Qdrant, else 'CHAT'.
        """
        system_prompt = (
            "You are a strict router. Classify the user's query. "
            "If the query asks for specific information, facts, knowledge, or definitions, "
            "respond with exactly the word 'RETRIEVAL'. "
            "If the query is a greeting, small talk, or doesn't require external knowledge, "
            "respond with exactly the word 'CHAT'."
        )
        user_prompt = f"Query: {query}"
        
        response = ollama_service.generate(
            model=settings.OLLAMA_INTENT_MODEL,
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )
        
        # Clean up the response to ensure we get a valid keyword
        if "RETRIEVAL" in response.upper():
            return "RETRIEVAL"
        return "CHAT"
    

intent_service = IntentService()

