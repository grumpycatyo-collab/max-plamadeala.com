import os
from openai import OpenAI
from dotenv import load_dotenv
from .file_manager import read_from_file
load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

phrases_list = read_from_file()



def call_openai() -> str:
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=f"You are an assistant that gives a short French phrase or expression that is different from these in here {phrases_list}.",
        input="Give me a phrase or word in French, no more than one line, with its translation in parentheses if needed. The message should be of this and only this structure: {phrase} (translation).",
        max_output_tokens=50,
        temperature=0.5,
    )
    return response.output_text


def get_french_phrase_dict() -> tuple:
    response = call_openai()
    phrase, translation = response.split(" (")
    translation = translation.rstrip(")")
    return phrase, translation