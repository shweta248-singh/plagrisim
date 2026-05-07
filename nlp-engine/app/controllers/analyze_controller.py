import time
from fastapi import HTTPException
from app.services.database_service import get_previous_submissions
from app.services.similarity_service import (
    calculate_overall_similarity,
    find_matching_sentences,
    determine_risk_level
)
from app.utils.logging import logger, log_safe_text

def analyze_text_controller(input_text: str, submission_id: str = None):
    start_time = time.perf_counter()
    print("ANALYZE REQUEST RECEIVED")
    logger.info(f"Starting analysis for text. Length: {len(input_text)} chars. SubmissionId: {submission_id}")

    try:
        # Fetch previous submissions from DB
        previous_submissions = get_previous_submissions(exclude_id=submission_id)
        logger.info(f"Fetched {len(previous_submissions)} documents for comparison. Excluding ID: {submission_id}")

        overall_max_similarity = 0.0
        all_matches = []

        for doc in previous_submissions:
            source_text = doc.get("originalText", "")
            source_name = doc.get("fileName", "Unknown File")
            source_id = str(doc.get("_id"))

            if not source_text.strip():
                continue

            # 🛑 CRITICAL FIX: Skip if text is exactly the same and we are trying to avoid self-comparison
            # (Though exclude_id should handle most cases)
            if input_text.strip() == source_text.strip():
                logger.warning(f"Skipping exact text match with document {source_id} to prevent self-comparison false positive.")
                continue

            # Calculate similarity score
            sim_score = calculate_overall_similarity(input_text, source_text)
            
            if sim_score > 0:
                logger.debug(f"Comparison with {source_name} ({source_id}): {sim_score}%")

            if sim_score > overall_max_similarity:
                overall_max_similarity = sim_score

            # Find specific sentence matches if there's some overall similarity
            if sim_score >= 10.0: # Only drill down if there's some overlap
                sentence_matches = find_matching_sentences(input_text, source_text)
                for match in sentence_matches:
                    all_matches.append({
                        "sourceId": source_id,
                        "sourceName": source_name,
                        "similarity": round(match["similarity"], 2),
                        "matchedText": match["matchedText"],
                        "inputText": match["inputText"],
                        "matchType": match["matchType"]
                    })

        # Sort matches by similarity
        all_matches = sorted(all_matches, key=lambda x: x["similarity"], reverse=True)
        
        # Limit number of matches returned to prevent huge payload
        top_matches = all_matches[:20]

        risk_level = determine_risk_level(overall_max_similarity)
        processing_time = int((time.perf_counter() - start_time) * 1000)

        # Generate a brief summary
        summary = f"Analysis complete. Found {len(top_matches)} matches with a maximum similarity of {overall_max_similarity}%."
        if overall_max_similarity == 0:
            summary = "No significant plagiarism detected. Content appears original."
        elif overall_max_similarity > 70:
            summary = f"High similarity detected ({overall_max_similarity}%). Multiple matches found."

        logger.info(f"Analysis complete in {processing_time}ms. Max Similarity: {overall_max_similarity}%")
        print("RESPONSE SENT")

        return {
            "success": True,
            "similarityScore": overall_max_similarity,
            "similarity": overall_max_similarity,
            "riskLevel": risk_level,
            "matches": top_matches,
            "summary": summary,
            "processingTimeMs": processing_time
        }

    except Exception as e:
        logger.error(f"Error in analyze_text_controller: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal NLP Engine Error")

def compare_two_texts_controller(text1: str, text2: str):
    start_time = time.perf_counter()
    logger.info(f"Comparing two texts. Lengths: {len(text1)} and {len(text2)} chars.")

    try:
        sim_score = calculate_overall_similarity(text1, text2)
        sentence_matches = find_matching_sentences(text1, text2)
        
        matches = []
        for match in sentence_matches:
            matches.append({
                "sourceId": "direct_comparison",
                "sourceName": "Text 2",
                "similarity": round(match["similarity"], 2),
                "matchedText": match["matchedText"],
                "inputText": match["inputText"],
                "matchType": match["matchType"]
            })

        risk_level = determine_risk_level(sim_score)
        processing_time = int((time.perf_counter() - start_time) * 1000)

        return {
            "success": True,
            "similarityScore": sim_score,
            "similarity": sim_score,
            "riskLevel": risk_level,
            "matches": sorted(matches, key=lambda x: x["similarity"], reverse=True)[:20],
            "processingTimeMs": processing_time
        }
    except Exception as e:
        logger.error(f"Error in compare_two_texts_controller: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal NLP Engine Error")
