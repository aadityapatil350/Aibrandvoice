export async function generateWithDeepSeek(prompt: string, systemPrompt?: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    throw new Error('DeepSeek API key not configured')
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'You are an expert content creator and social media strategist. Generate engaging, well-structured content optimized for different platforms. Always return valid JSON when requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error: ${response.status}: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}
