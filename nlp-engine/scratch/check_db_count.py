import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

def check_db():
    print(f"Connecting to: {MONGO_URI}")
    print(f"Database: {DATABASE_NAME}")
    print(f"Collection: {COLLECTION_NAME}")
    
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        count = collection.count_documents({})
        print(f"\nTotal documents in '{COLLECTION_NAME}': {count}")
        
        if count > 0:
            print("\nFirst 5 documents (preview):")
            for doc in collection.find().limit(5):
                print(f"- ID: {doc.get('_id')}, Name: {doc.get('fileName', 'N/A')}, Text snippet: {str(doc.get('originalText', ''))[:50]}...")
        else:
            print("\nThe collection is EMPTY.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()