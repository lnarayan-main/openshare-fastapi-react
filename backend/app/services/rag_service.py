import ollama
from app.services.intent_service import intent_service
from app.services.qdrant_service import search_query
from app.services.generation_service import generation_service
from app.core.config import settings
from app.core.redis_client import redis_client
from app.services.ollama_service import ollama_service


# def _get_fallback_message() -> str:
#     return (
#         "I couldn't find any relevant information in the database to answer your question. "
#         f"For further assistance, please reach out to our support team:\n"
#         f"📧 Email: {settings.CONTACT_EMAIL}\n"
#         f"📞 Phone: {settings.CONTACT_PHONE}"
#     )
    
    
def _get_fallback_message() -> str:
    return (
        "I couldn't find any relevant information in the database to answer your question.\n\n"
        "For further assistance, please reach out to our support team:\n\n"
        f"📧 Email: [support@yourapp.com](mailto:{settings.CONTACT_EMAIL})\n\n"
        f"📞 Phone: [{settings.CONTACT_PHONE}](tel:{settings.CONTACT_PHONE})\n\n"
        "For more information, [click here](https://your-website.com/help)."
    )

class RAGService:
    @staticmethod
    def generate_full(query: str, search_results: list) -> str:
        """Generate a full answer (non-streaming) from context."""
        if not search_results:
            return _get_fallback_message()
        
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
        
        # Use non-streaming call
        response = ollama.chat(
            model=settings.OLLAMA_GEN_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            stream=False
        )
        return response["message"]["content"].strip()
    
    @staticmethod
    def ask(query: str, limit: int = 3, use_cache: bool = True) -> dict:
        """
        Full RAG pipeline:
        1. Check cache
        2. Classify intent
        3. If RETRIEVAL -> Search Qdrant -> Generate answer
        4. If CHAT -> Direct chat (no context)
        """
        
        # 1. Check cache
        if use_cache:
            cached = redis_client.get(query)
            if cached:
                return cached
        
        # 2: Intent Classification
        intent = intent_service.classify(query)
        
        if intent == "CHAT":
            # For generic chat, just use the generator without context
            
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
            
        # 3: Retrieve from Qdrant(using your existing function)
        search_results = search_query(query, limit=limit)
        
        
        # 4: Generate Answer from context
        # result = generation_service.answer(query, search_results)
        # result['intent'] = 'retrieval'
        # result['query'] = query
        # return result
        
        answer = RAGService.generate_full(query, search_results)
        sources = []
        for r in search_results:
            sources.append({
                "id": r.get("id"),
                "text": r.get("payload", {}).get("text"),
                "score": r.get("score")
            })
        result = {
            "query": query,
            "answer": answer,
            "sources": sources,
            "intent": "retrieval"
        }
        
        # 5. Cache the result for future identical queries
        if use_cache:
            redis_client.set(query, result)

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
            yield _get_fallback_message()
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
                
                
                
    @staticmethod
    def stream_with_cache(query: str, limit: int = 3):
        """
        Streaming endpoint with cache. Yields:
        1. A 'sources' event (if retrieval mode)
        2. Tokens (streaming)
        """
        # 1. Check cache
        cached = redis_client.get(query)
        if cached:
            # Yield sources (from cached data)
            if cached.get("sources"):
                yield ("sources", cached["sources"])
            # Yield tokens
            full_answer = cached.get("answer", "")
            for word in full_answer.split():
                yield ("token", word + " ")
            return

        # 2. Cache miss: run intent classification
        intent = intent_service.classify(query)
        if intent == "CHAT":
            answer = ollama_service.generate(
                model=settings.OLLAMA_GEN_MODEL,
                system_prompt="You are a helpful, friendly assistant. Keep responses concise.",
                user_prompt=query
            )
            result = {"query": query, "answer": answer, "sources": [], "intent": "chat"}
            redis_client.set(query, result)
            for word in answer.split():
                yield ("token", word + " ")
            return

        # 3. Retrieval + Generation
        search_results = search_query(query, limit=limit)
        
        # 4. 🚨 NEW: Check relevance threshold (e.g., 0.4)
        RELEVANCE_THRESHOLD = 0.4  # You can adjust this
        is_relevant = False
        if search_results:
            top_score = search_results[0].get("score", 0)
            if top_score >= RELEVANCE_THRESHOLD:
                is_relevant = True
        
         # 5. If no results OR scores are too low → trigger fallback
        if not search_results or not is_relevant:
            fallback = _get_fallback_message()
            result = {"query": query, "answer": fallback, "sources": [], "intent": "retrieval"}
            redis_client.set(query, result)
            yield ("sources", [])  # Send empty sources
            for word in fallback.split():
                yield ("token", word + " ")
            return
        
        # 6. Proceed with normal RAG (sources + LLM streaming)
        sources = [{"id": r.get("id"), "text": r.get("payload", {}).get("text"), "score": r.get("score")}
                for r in search_results]
        
        # Yield sources first
        yield ("sources", sources)

        # Build context and stream
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

        full_answer = ""
        stream = ollama.chat(
            model=settings.OLLAMA_GEN_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            stream=True
        )

        for chunk in stream:
            token = chunk.get('message', {}).get('content', '')
            if token:
                full_answer += token
                yield ("token", token)

        # Cache full response
        result = {
            "query": query,
            "answer": full_answer,
            "sources": sources,
            "intent": "retrieval"
        }
        redis_client.set(query, result)
        
    
rag_service = RAGService()

