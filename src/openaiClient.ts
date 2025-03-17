const token: string = import.meta.env.VITE_OPENROUTER_API_KEY;
const siteUrl: string = import.meta.env.VITE_SITE_URL;
const siteName: string = import.meta.env.VITE_SITE_NAME;

if (!token) {
  throw new Error("VITE_OPENROUTER_API_KEY environment variable is not set.");
}

export const getAIResponse = async (userMessage: string): Promise<string> => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("HTTP-Referer", siteUrl);
  headers.append("X-Title", siteName);
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({
    model: "deepseek/deepseek-r1:free",
    messages: [
      {
        role: "system",
        content: "You are a bold, confident, no-nonsense financial expert who gives aggressive money advice. You push people to escape the 9-to-5, build wealth fast, and master high-income skills. No sugarcoating—only direct, action-driven advice."
      },
      {
        role: "user",
        content: userMessage
      }
    ]
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: headers,
    body: body,
    redirect: "follow"
  };

  try {
    const response = await fetch(siteUrl, requestOptions);
    const result = await response.json();
    return result.choices[0]?.message?.content || "Sorry, I couldn't process that.";
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "An error occurred while fetching the response.";
  }
};
