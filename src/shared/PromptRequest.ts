interface PromptRequest {
  promptType: 'open' | 'save' | 'text' | 'password' | 'image' | 'position' | 'single' | 'boolean';
  question: string;
  defaultValue: string;
  /**
   * Available for select types
   */
  options?: Array<{ key: string; value: string }>;
}

export default PromptRequest;
