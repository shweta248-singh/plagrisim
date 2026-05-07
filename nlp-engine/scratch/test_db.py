import os
import sys
from pathlib import Path

# Add project root to sys.path
root = Path(__file__).parent.parent
sys.path.append(str(root))

from app.config.database import submissions_collection, get_db_status
from app.services.database_service import get_previous_submissions

def test_connection():
    print(f"Testing DB Status: {get_db_status()}")
    print(f"Collection Name: {submissions_collection.name}")
    print(f"Database Name: {submissions_collection.database.name}")
    
    try:
        count = submissions_collection.count_documents({})
        print(f"Total documents in collection: {count}")
        
        # Test fetching submissions
        subs = get_previous_submissions()
        print(f"Fetched {len(subs)} submissions for comparison.")
        if len(subs) > 0:
            print(f"First doc name: {subs[0].get('fileName')}")
            print(f"First doc text snippet: {subs[0].get('originalText')[:50]}...")
            
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_connection()
