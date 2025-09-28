import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API
});

export const getAIResponse = async (userMessage: string): Promise<string> => {
  try {
    // Get past chat from localStorage
    const pastChats: string[] = JSON.parse(localStorage.getItem('pastChat') || '[]');
    // Format past chat as a single string
    const pastChatContext = pastChats.length
      ? "Past conversation:\n" + pastChats.join('\n') + "\n\n"
      : "";

    const prompt =
      "You are a bold, confident, no-nonsense financial expert who gives aggressive money advice. You push people to escape the 9-to-5, build wealth fast, and master high-income skills. No sugarcoating—only direct, action-driven advice.\n\n" +
      pastChatContext +
      "User: " + userMessage;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            {
              text: prompt
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
