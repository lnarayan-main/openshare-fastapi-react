from app.services.ollama_service import ollama_service
from app.core.config import settings


class GenerationService:
    @staticmethod
    def answer(query: str, search_results: list) -> dict:
        """
        Generates an answer using the search results as context.
        """
        if not search_results:
            return {
                "answer": "I couldn't find any relevant information in the database to answer that.",
                "sources": []
            }
            
        # Extract text from search results for context
        context_parts = []
        sources = []
        for idx, result in enumerate(search_results, 1):
            text = result.get("payload", {}).get("text", "")
            if text:
                context_parts.append(f"Document {idx}: {text}")
                sources.append({"id": result.get("id"), "text": text, "score": result.get("score")})
                
        context = "\n".join(context_parts)
        
        system_prompt = (
            "You are a helpful AI assistant. Answer the user's question based **strictly** on the provided context. "
            "If the context does not contain enough information to answer the question, "
            "clearly say 'I don't have enough information to answer that.' Do not make up facts."
        )
        
        user_prompt = f"Context: \n{context}\n\nQuestion: {query}"
        
        answer_text = ollama_service.generate(
            model=settings.OLLAMA_GEN_MODEL,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
        
        return {
            "answer": answer_text,
            "sources": sources
        }
        

generation_service = GenerationService()


                