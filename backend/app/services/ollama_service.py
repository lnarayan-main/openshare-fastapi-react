import ollama
from app.core.config import settings


class OllamaService:
    @staticmethod
    def generate(model: str, system_prompt: str, user_prompt: str) -> str:
        """
        Unified method to call any Ollama chat model.
        """
        try:
            response = ollama.chat(
                model=model,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt}
                ]
            )
            return response['message']['content'].strip()
        except Exception as e:
            print(f"Ollama Error: {e}")
            return "I am currently unable to process that request due to a technical issue."
        
    
# Global instance
ollama_service = OllamaService()
