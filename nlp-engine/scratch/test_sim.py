import sys
from pathlib import Path

# Add project root to sys.path
root = Path(__file__).parent.parent
sys.path.append(str(root))

from app.services.similarity_service import calculate_overall_similarity

def test_similarity():
    text1 = "This is a sample text for plagiarism detection. It should be long enough."
    text2 = "This is a sample text for plagiarism detection. It should be long enough."
    
    score = calculate_overall_similarity(text1, text2)
    print(f"Similarity Score (identical): {score}%")
    
    text3 = "This is a completely different sentence with no overlap at all."
    score2 = calculate_overall_similarity(text1, text3)
    print(f"Similarity Score (different): {score2}%")

if __name__ == "__main__":
    test_similarity()
