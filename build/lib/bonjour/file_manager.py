
def store_in_file(phrase: str, translation: str) -> None:
    """
    Store the French phrase and its translation in a dictionary.

    Args:
        phrase (str): The French phrase.
        translation (str): The English translation of the phrase.
    """
    try:
        with open("french_phrases.txt", "a") as file:
            file.write(f"{phrase} ({translation})\n")
            return None
    except Exception as e:
        print(f"An error occurred while writing to the file: {e}")
        return None


def read_from_file() -> list:
    """
    Read the French phrases and their translations from the file.

    Returns:
        list: A list of tuples containing the French phrase and its translation.
    """
    try:
        with open("french_phrases.txt", "r") as file:
            lines = file.readlines()
            phrases = [line.strip() for line in lines]
            return phrases
    except FileNotFoundError:
        return []
    except Exception as e:
        print(f"An error occurred while reading the file: {e}")
        return []