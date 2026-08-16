import ollama
from app.services.intent_service import intent_service
from app.services.qdrant_service import search_query
from app.services.generation_service import generation_service
from app.core.config import settings


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
    
    @staticmethod
    def retrieve(query: str, limit: int = 3) -> list:
        """Step 1: Retrieve relevant documents from Qdrant."""
        return search_query(query, limit=limit)

    @staticmethod
    def generate_stream(query: str, search_results: list):
        """Step 2: Stream the answer token by token from Ollama."""
        if not search_results:
            # Yield a single message if no context
            yield "I couldn't find any relevant information in the database to answer that."
            return

        # Build context from search results
        context_parts = []
        for idx, result in enumerate(search_results, 1):
            text = result.get("payload", {}).get("text", "")
            if text:
                context_parts.append(f"Document {idx}: {text}")
        context = "\n".join(context_parts)

        system_prompt = (
            "You are a helpful AI assistant. Answer the user's question based **strictly** on the provided context. "
            "If the context does not contain enough information to answer the question, "
            "clearly say 'I don't have enough information to answer that.' Do not make up facts."
        )
        user_prompt = f"Context:\n{context}\n\nQuestion: {query}"

        # Call Ollama with stream=True
        stream = ollama.chat(
            model=settings.OLLAMA_GEN_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            stream=True  # <-- This enables token-by-token streaming
        )

        # Yield each token as it arrives
        for chunk in stream:
            # In Ollama's streaming response, the content is in chunk['message']['content']
            token = chunk.get('message', {}).get('content', '')
            if token:
                yield token
    
rag_service = RAGService()

