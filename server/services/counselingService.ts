import CounselingLog from '../models/CounselingLog';
import User from '../models/User';
import geminiService from './geminiService';
import promptService from './promptService';

class CounselingService {
  async getHistory(userId: string) {
    return CounselingLog.find({ userId }).sort({ timestamp: 1 });
  }

  async postMessage(userId: string, message: string) {
    // 1. Save user message
    const userLog = new CounselingLog({ userId, speaker: 'user', message });
    await userLog.save();

    // 2. Get conversation history for the prompt
    const history = await CounselingLog.find({ userId }).sort({ timestamp: -1 }).limit(30);
    const conversation_history = history.reverse().map(log => 
      `${log.speaker === 'user' ? '플레이어' : '상담가'}: ${log.message}`
    ).join('\n');

    // 3. Get AI response (AI-9)
    const prompt = promptService.getPrompt('ongoing_counseling_prompt', {
      conversation_history,
      player_input: message,
    });
    const aiResponse = await geminiService.generateText(prompt);

    // 4. Save AI response
    const aiLog = new CounselingLog({ userId, speaker: 'ai', message: aiResponse });
    await aiLog.save();

    // 5. Update player analysis in the background (fire-and-forget)
    this.updatePlayerAnalysis(userId);

    return { message: aiResponse };
  }

  async updatePlayerAnalysis(userId: string) {
    try {
      console.log(`Updating analysis for user ${userId}...`);
      const user = await User.findById(userId);
      if (!user || !user.playerAnalysis) return;

      const recent_counseling_log = (await CounselingLog.find({ userId }).sort({ timestamp: -1 }).limit(50))
        .reverse().map(l => `${l.speaker === 'user' ? '플레이어' : '상담가'}: ${l.message}`).join('\n');

      const prompt = promptService.getPrompt('ongoing_counseling_analysis_prompt', {
        current_analysis: user.playerAnalysis,
        recent_counseling_log,
      });

      const { updatedAnalysis } = await geminiService.generateJson(prompt);
      
      await User.findByIdAndUpdate(userId, { playerAnalysis: updatedAnalysis });
      console.log(`Successfully updated analysis for user ${userId}.`);
    } catch (error) {
      console.error(`Failed to update player analysis for user ${userId}:`, error);
    }
  }
}

export default CounselingService;
