from bson import ObjectId
from app.config.database import submissions_collection
from app.utils.logging import logger

def get_previous_submissions(exclude_id: str = None):
    """Fetches stored documents from MongoDB for comparison."""
    query = {"originalText": {"$exists": True, "$ne": ""}}
    
    if exclude_id:
        try:
            # Handle string, bytes, or already ObjectId
            if not isinstance(exclude_id, ObjectId):
                query["_id"] = {"$ne": ObjectId(str(exclude_id))}
            else:
                query["_id"] = {"$ne": exclude_id}
        except Exception as e:
            logger.warning(f"Invalid ObjectId for exclusion: {exclude_id}. Using string comparison fallback.")
            query["_id"] = {"$ne": exclude_id}

    logger.debug(f"MongoDB Query: {query}")

    try:
        submissions = submissions_collection.find(
            query,
            {
                "_id": 1,
                "fileName": 1,
                "originalText": 1,
                "fingerprints": 1,
                "createdAt": 1
            }
        ).limit(100) # Increased limit for better coverage
        
        result_list = list(submissions)
        logger.info(f"Successfully fetched {len(result_list)} previous submissions from DB.")
        return result_list
    except Exception as e:
        logger.error(f"Error fetching submissions from MongoDB: {str(e)}", exc_info=True)
        return []
