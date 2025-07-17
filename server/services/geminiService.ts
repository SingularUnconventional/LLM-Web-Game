import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import genAI from '../config/gemini';
import promptService from './promptService';

// A helper function to handle potential JSON parsing errors
function parseJson(jsonString: string): any {
  try {
    // Gemini sometimes wraps JSON in markdown-style backticks
    const cleanJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    return JSON.parse(cleanJsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', jsonString);
    throw new Error('Received invalid JSON response from AI model.');
  }
}

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

class GeminiService {
  async generateText(prompt: string): Promise<string> {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error('Error generating text with Gemini:', error);
      // Check if it's a safety-related block
      if (error.message.includes('SAFETY')) {
        return "죄송합니다, 저의 안전 규칙에 따라 해당 내용에 대해서는 답변할 수 없어요. 다른 이야기를 해볼까요?";
      }
      throw new Error('Failed to generate text from AI.');
    }
  }

  async generateFinalPersona(finalPlayerAnalysis: any, allConversationLogs: string): Promise<any> {
    try {
      const promptTemplate = await promptService.getPrompt('final_persona_generation_prompt.txt');
      const prompt = promptTemplate
        .replace('{{finalPlayerAnalysis}}', JSON.stringify(finalPlayerAnalysis, null, 2))
        .replace('{{allConversationLogs}}', allConversationLogs);
      
      return await this.generateJson(prompt);
    } catch (error) {
      console.error('Error generating final persona with Gemini:', error);
      throw new Error('Failed to generate final persona from AI.');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    const imageModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Or a more specialized image model if available and necessary
    });

    try {
      const result = await imageModel.generateContent(prompt);
      const response = result.response;
      // Assuming the response contains a URL or a way to get one. 
      // This part might need adjustment based on actual Gemini Vision API response structure.
      // For now, we'll assume text() might return a URL or a description that can be parsed.
      // In a real scenario, we'd expect a specific image generation output format.
      const imageUrl = response.text(); // Placeholder: Actual implementation might differ
      return imageUrl;
    } catch (error) {
      console.error('Error generating image with Gemini:', error);
      throw new Error('Failed to generate image from AI.');
    }
  }

  async generateJson(prompt: string): Promise<any> {
    const jsonModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      // Safety settings can also be applied here if needed
    });

    try {
      const result = await jsonModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating JSON with Gemini:', error);
      throw new Error('Failed to generate JSON from AI.');
    }
  }
}

export default new GeminiService();