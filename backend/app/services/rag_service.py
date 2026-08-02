from app.services.intent_service import intent_service
from app.services.qdrant_service import search_query
from app.services.generation_service import generation_service


class RAGService:
    @staticmethod
    def ask(query: str, limit: int = 3) -> dict:
        """
        Full RAG pipeline:
        1. Classify intent
        2. If RETRIEVAL -> Search Qdrant -> Generate answer
        3. If CHAT -> Direct chat (no context)
        """
        
        # Step 1: Intent Classification
        intent = intent_service.classify(query)
        
        if intent == "CHAT":
            # For generic chat, just use the generator without context
            from app.services.ollama_service import ollama_service
            from app.core.config import settings
            
            response = ollama_service.generate(
                model=settings.OLLAMA_GEN_MODEL,
                system_prompt="You are a helpful, friendly assistant. Keep responses concise.",
                user_prompt=query
            )
            
            return {
                "query": query,
                "answer": response,
                "source": [],
                "intent": "chat"
            }
            
        # Step 2: Retrieve from Qdrant(using your existing function)
        search_results = search_query(query, limit=limit)
        
        
        # Step 3: Generate Answer from context
        result = generation_service.answer(query, search_results)
        result['intent'] = 'retrieval'
        result['query'] = query
        return result
    
rag_service = RAGService()

