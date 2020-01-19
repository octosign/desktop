interface PromptRequest {
  promptType: 'open' | 'save' | 'text' | 'password' | 'boolean' | 'image' | 'position';
  question: string;
  defaultValue?: string;
}

export default PromptRequest;
