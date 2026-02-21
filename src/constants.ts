export const AGENT_PRESETS = [
  {
    id: 'simplifier',
    name: 'To Simple English',
    instruction:
      '1. Improve the following text in english.\n2. Just return the created text in a way I can copy and paste.\n3. Do it very shortly and simple words for non native english.',
  },
  {
    id: 'translator-es',
    name: 'Translator (EN → ES)',
    instruction:
      'Translate the following text to Spanish. Maintain the tone and context. Be precise and natural sounding.',
  },
  {
    id: 'summarizer',
    name: 'Summarizer',
    instruction:
      'Summarize the following content concisely. Focus on the main points and key takeaways.',
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    instruction:
      'Review the following code. Check for bugs, security issues, performance problems, and readability. Suggest improvements with brief explanations. Format your response with clear sections.',
  },
  {
    id: 'email-writer',
    name: 'Email Writer',
    instruction:
      'Write a professional email based on the following notes or bullet points. Keep it concise, clear, and ready to send. Include a subject line suggestion.',
  },
  {
    id: 'blog-post',
    name: 'Blog Post Writer',
    instruction:
      'Turn the following idea or notes into a well-structured blog post. Include a catchy title, introduction, body with clear sections, and a conclusion. Keep the tone engaging and informative.',
  },
  {
    id: 'tweet-writer',
    name: 'Tweet / Social Post',
    instruction:
      'Craft a concise, engaging social media post based on the following content. Keep it under 280 characters when possible. Make it attention-grabbing and include relevant hashtag suggestions.',
  },
];
