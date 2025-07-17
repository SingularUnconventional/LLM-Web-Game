import fs from 'fs/promises';
import path from 'path';

class PromptService {
  private promptTemplates: Map<string, string> = new Map();
  private coreTemplate: string = '';
  private readonly PROMPT_DIR = path.join(__dirname, '..', 'prompts');
  private readonly CORE_TEMPLATE_NAME = 'ai_core_prompt_template';

  constructor() {
    this.loadAllPrompts();
  }

  private async loadAllPrompts() {
    try {
      const files = await fs.readdir(this.PROMPT_DIR);
      for (const file of files) {
        if (file.endsWith('.txt')) {
          const filePath = path.join(this.PROMPT_DIR, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const templateName = file.replace('.txt', '');
          this.promptTemplates.set(templateName, content);
        }
      }
      this.coreTemplate = this.promptTemplates.get(this.CORE_TEMPLATE_NAME) || '';
      if (!this.coreTemplate) {
        console.error('!!! CRITICAL: AI Core Prompt Template not found !!!');
      }
      console.log('[PromptService] All prompt templates loaded successfully.');
    } catch (error) {
      console.error('Error loading prompt templates:', error);
      throw error; // Rethrow to indicate a critical failure on startup
    }
  }

  public getPrompt(templateName: string, data: Record<string, any> = {}): string {
    let template = this.promptTemplates.get(templateName);

    if (!template) {
      throw new Error(`Prompt template '${templateName}' not found.`);
    }

    // Inject the core template into other templates
    if (templateName !== this.CORE_TEMPLATE_NAME) {
      template = template.replace('{{ai_core_prompt_template}}', this.coreTemplate);
    }

    // Replace all other placeholders
    return template.replace(/{{(.*?)}}/g, (match, key) => {
      const value = data[key.trim()];
      if (value === undefined || value === null) {
        return match; // Keep the placeholder if data is not available
      }
      // If the value is an object, stringify it
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    });
  }
}

export default new PromptService();
