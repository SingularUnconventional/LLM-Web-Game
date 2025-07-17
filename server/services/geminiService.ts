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

class GeminiService {
  private textModel: GenerativeModel;
  private imageModel: GenerativeModel;

  constructor() {
    // Model for text-based generation and chat
    this.textModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
    });

    // Model for image generation
    this.imageModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' }); // Placeholder, will use a proper image model
  }

  /**
   * A generic helper to call the Gemini text model.
   * @param prompt The complete prompt to send to the model.
   * @param expectJson If true, configures the model to expect a JSON response.
   * @returns The raw text response from the model.
   */
  private async _callTextModel(prompt: string, expectJson: boolean = false): Promise<string> {
    const generationConfig = expectJson ? { responseMimeType: 'application/json' } : {};
    const result = await this.textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });
    return result.response.text();
  }

  // [AI-1] & [AI-9] Initial and Ongoing Counseling Response
  async getCounselingResponse(promptName: string, history: any[]): Promise<string> {
    const prompt = promptService.getPrompt(promptName, { counseling_history: history });
    return this._callTextModel(prompt);
  }

  // [AI-2] Initial Counseling Analysis
  async analyzeInitialCounseling(log: string): Promise<any> {
    const prompt = promptService.getPrompt('initial_counseling_analysis_prompt', { counseling_log: log });
    const response = await this._callTextModel(prompt, true);
    return parseJson(response);
  }

  // [AI-3] Character Dialogue
  async getCharacterDialogue(characterProfile: any, history: any[], playerInput: string): Promise<string> {
    const prompt = promptService.getPrompt('character_dialogue_prompt', {
      character_profile: characterProfile,
      conversation_history: history,
      player_input: playerInput,
    });
    return this._callTextModel(prompt);
  }

  // [AI-4] Conversation Summary
  async summarizeConversation(characterName: string, problem: string, log: string): Promise<any> {
    const prompt = promptService.getPrompt('conversation_summary_prompt', {
      character_name: characterName,
      character_problem: problem,
      conversation_log: log,
    });
    const response = await this._callTextModel(prompt, true);
    return parseJson(response);
  }

  // [AI-5] Emotion Keyword Extraction
  async extractEmotionKeywords(summary: string, outcome: string): Promise<string[]> {
    const prompt = promptService.getPrompt('emotion_keyword_extraction_prompt', { summary, outcome });
    const response = await this._callTextModel(prompt, true);
    return parseJson(response);
  }

  // [AI-6] Player Deep Analysis
  async analyzePlayerData(gameDay: number, analysis: any, log: string, answers: any[]): Promise<any> {
    const prompt = promptService.getPrompt('player_deep_analysis_prompt', {
      gameDay: gameDay,
      existingPlayerAnalysis: analysis,
      lastConversationLog: log,
      psychologyAnswers: answers,
    });
    const response = await this._callTextModel(prompt, true);
    return parseJson(response);
  }

  // [AI-7] & [AI-11] Fairy Tale and Persona Character Generation
  async generateCharacter(promptName: string, data: any): Promise<any> {
    const prompt = promptService.getPrompt(promptName, data);
    const response = await this._callTextModel(prompt, true);
    return parseJson(response);
  }

  // [AI-8] Profile Image Generation
  async generateImage(characterDescription: string): Promise<string> {
    // This uses a placeholder as the actual image generation API call might differ.
    // The prompt is prepared here for the call.
    const prompt = promptService.getPrompt('image_generation_prompt', { character_description: characterDescription });
    
    // In a real scenario, you would use a library like @google-cloud/aiplatform
    // to call the image generation model endpoint.
    // For now, we'll return a placeholder URL.
    console.log(`[GeminiService] Image generation prompt: ${prompt}`);
    return `https://picsum.photos/seed/${encodeURIComponent(characterDescription)}/512`;
  }

  // [AI-10] Ongoing Counseling Analysis
  async analyzeOngoingCounseling(analysis: any, log: string): Promise<any> {
    const prompt = promptService.getPrompt('ongoing_counseling_analysis_prompt', {
      existingPlayerAnalysis: analysis,
      newCounselingLog: log,
    });
    const response = await this._callTextModel(prompt, true);
    return parseJson(response);
  }
}

export default new GeminiService();