import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDqrW7zSUFw3mSTeLMnHkxRNyC8pw7YSkA"
});

export const getAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            {
              text:
                "You are a bold, confident, no-nonsense financial expert who gives aggressive money advice. You push people to escape the 9-to-5, build wealth fast, and master high-income skills. No sugarcoating—only direct, action-driven advice.\n\n" +
                userMessage
            }
          ]
        }
      ]
    });
    return response.text || "Sorry, I couldn't process that.";
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "An error occurred while fetching the response.";
  }
};
