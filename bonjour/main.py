import typer
from rich import print
from .gpt_call import get_french_phrase_dict
from .file_manager import store_in_file

app = typer.Typer()

@app.command()
def greet():
    phrase, translation = get_french_phrase_dict()
    store_in_file(phrase, translation)

    print(f"[bold green]{phrase}[/bold green] ([bold red]{translation}[/bold red])")

if __name__ == "__main__":
    app()
