def latent_gaze_search(image_input, user_context_vector):
    # 1. THE GLANCE: Analyze image content
    visual_features = analyze_image(image_input)

    # 2. THE HALLUCINATION: Generate 5 wild predictions (High Temperature)
    # We allow the AI to 'hallucinate' potential needs rather than just matching objects
    raw_predictions = ai_model.generate(
        prompt=f"User is looking at {visual_features}. Invent 5 drastically different reasons why.",
        temperature=0.8 # High creativity
    )

    # 3. THE NARROW DOWN: Calculate cosine similarity against user interests
    # (e.g., Fishing, Cybersecurity, Art)
    best_match = None
    highest_score = 0

    for prediction in raw_predictions:
        score = vector_similarity(prediction, user_context_vector)
        if score > highest_score:
            highest_score = score
            best_match = prediction

    # 4. Return the single most likely intent
    return best_match
