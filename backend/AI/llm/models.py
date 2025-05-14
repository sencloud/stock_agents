import os
from langchain_deepseek import ChatDeepSeek
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from enum import Enum
from pydantic import BaseModel
from typing import Tuple, List, Dict, Any, Optional
from config import settings

class ModelProvider(str, Enum):
    """Enum for supported LLM providers"""
    DEEPSEEK = "DeepSeek"
    OPENAI = "OpenAI"
    OLLAMA = "Ollama"



class LLMModel(BaseModel):
    """Represents an LLM model configuration"""
    display_name: str
    model_name: str
    provider: ModelProvider

    def to_choice_tuple(self) -> Tuple[str, str, str]:
        """Convert to format needed for questionary choices"""
        return (self.display_name, self.model_name, self.provider.value)
    
    def has_json_mode(self) -> bool:
        """Check if the model supports JSON mode"""
        if self.is_deepseek() or self.is_gemini():
            return False
        # Only certain Ollama models support JSON mode
        if self.is_ollama():
            return "llama3" in self.model_name or "neural-chat" in self.model_name
        return True
    
    def is_deepseek(self) -> bool:
        """Check if the model is a DeepSeek model"""
        return self.model_name.startswith("deepseek")
        
    def is_ollama(self) -> bool:
        """Check if the model is an Ollama model"""
        return self.provider == ModelProvider.OLLAMA


# Define available models
AVAILABLE_MODELS = [
    LLMModel(
        display_name="[deepseek] deepseek-r1",
        model_name="deepseek-reasoner",
        provider=ModelProvider.DEEPSEEK
    ),
    LLMModel(
        display_name="[deepseek] deepseek-v3",
        model_name="deepseek-chat",
        provider=ModelProvider.DEEPSEEK
    ),
    LLMModel(
        display_name="[openai] gpt-4.5",
        model_name="gpt-4.5-preview",
        provider=ModelProvider.OPENAI
    ),
    LLMModel(
        display_name="[openai] gpt-4o",
        model_name="gpt-4o",
        provider=ModelProvider.OPENAI
    ),
    LLMModel(
        display_name="[openai] o1",
        model_name="o1",
        provider=ModelProvider.OPENAI
    ),
    LLMModel(
        display_name="[openai] o3-mini",
        model_name="o3-mini",
        provider=ModelProvider.OPENAI
    ),
]

# Define Ollama models separately
OLLAMA_MODELS = [
    LLMModel(
        display_name="[ollama] gemma3 (4B)",
        model_name="gemma3:4b",
        provider=ModelProvider.OLLAMA
    ),
    LLMModel(
        display_name="[ollama] qwen2.5 (7B)",
        model_name="qwen2.5",
        provider=ModelProvider.OLLAMA
    ),
    LLMModel(
        display_name="[ollama] llama3.1 (8B)",
        model_name="llama3.1:latest",
        provider=ModelProvider.OLLAMA
    ),
    LLMModel(
        display_name="[ollama] gemma3 (12B)",
        model_name="gemma3:12b",
        provider=ModelProvider.OLLAMA
    ),
    LLMModel(
        display_name="[ollama] mistral-small3.1 (24B)",
        model_name="mistral-small3.1",
        provider=ModelProvider.OLLAMA
    ),
    LLMModel(
        display_name="[ollama] gemma3 (27B)",
        model_name="gemma3:27b",
        provider=ModelProvider.OLLAMA
    ),
    LLMModel(
        display_name="[ollama] qwen2.5 (32B)",
        model_name="qwen2.5:32b",
        provider=ModelProvider.OLLAMA
    ),
    LLMModel(
        display_name="[ollama] llama-3.3 (70B)",
        model_name="llama3.3:70b-instruct-q4_0",
        provider=ModelProvider.OLLAMA
    ),
]

# Create LLM_ORDER in the format expected by the UI
LLM_ORDER = [model.to_choice_tuple() for model in AVAILABLE_MODELS]

# Create Ollama LLM_ORDER separately
OLLAMA_LLM_ORDER = [model.to_choice_tuple() for model in OLLAMA_MODELS]

def get_model_info(model_name: str) -> LLMModel | None:
    """Get model information by model_name"""
    all_models = AVAILABLE_MODELS + OLLAMA_MODELS
    return next((model for model in all_models if model.model_name == model_name), None)

def get_model(model_name: str, model_provider: ModelProvider) -> ChatOpenAI | ChatOllama | None:
    if model_provider == ModelProvider.OPENAI:
        # Get and validate API key
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            # Print error to console
            print(f"API Key Error: Please make sure OPENAI_API_KEY is set in your .env file.")
            raise ValueError("OpenAI API key not found.  Please make sure OPENAI_API_KEY is set in your .env file.")
        base_url = settings.OPENAI_BASE_URL
        return ChatOpenAI(model=model_name, api_key=api_key, base_url=base_url)
    elif model_provider == ModelProvider.DEEPSEEK:
        api_key = settings.DEEPSEEK_API_KEY
        if not api_key:
            print(f"API Key Error: Please make sure DEEPSEEK_API_KEY is set in your .env file.")
            raise ValueError("DeepSeek API key not found.  Please make sure DEEPSEEK_API_KEY is set in your .env file.")
        return ChatDeepSeek(model=model_name, api_key=api_key)
    elif model_provider == ModelProvider.OLLAMA:
        # For Ollama, we use a base URL instead of an API key
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        return ChatOllama(
            model=model_name, 
            base_url=base_url,
        )