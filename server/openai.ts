import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateRecommendation(
  likedAlbums: string[],
  reviews: string[]
): Promise<{ recommendations: string[], explanation: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a music recommendation expert. Based on the user's liked albums and their reviews, suggest similar albums they might enjoy. Provide recommendations and a brief explanation of why they might like each one. Return in JSON format with 'recommendations' array and 'explanation' string.",
        },
        {
          role: "user",
          content: `Liked albums: ${likedAlbums.join(", ")}\nReviews: ${reviews.join("\n")}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    throw new Error("Failed to generate recommendations: " + error.message);
  }
}

export async function analyzeSentiment(review: string): Promise<{
  rating: number;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Analyze the sentiment of this music review and provide a rating from 1 to 5 stars and confidence score between 0 and 1. Return in JSON format.",
        },
        {
          role: "user",
          content: review,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error) {
    throw new Error("Failed to analyze sentiment: " + error.message);
  }
}
