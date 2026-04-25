import { GoogleGenAI } from '@google/genai'

export function createGeminiClient() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey) {
        throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.')
    }

    return new GoogleGenAI({ apiKey: apiKey })
}

export async function generateContentStreamWithFallback(ai, fullContent) {
    const modelNames = [
        'gemini-3-flash-preview',
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro',
        'gemini-1.5-flash'
    ]

    let lastError = null

    for (let i = 0; i < modelNames.length; i++) {
        const modelName = modelNames[i]

        try {
            const stream = await ai.models.generateContentStream({
                model: modelName,
                contents: fullContent
            })

            return stream
        } catch (error) {
            lastError = error

            const errorMessage = error.message || error.toString()

            if (
                errorMessage.includes('404') ||
                errorMessage.includes('not found') ||
                errorMessage.includes('not supported')
            ) {
                console.warn('Model ' + modelName + ' not available, trying next...')
                continue
            }

            throw error
        }
    }

    throw lastError || new Error('No available Gemini model found.')
}