import { GoogleGenAI } from '@google/genai'
import * as pdfjsLib from 'pdfjs-dist'

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map(item => item.str).join(' ')
            fullText += pageText + '\n\n'
        }

        return fullText.trim()
    } catch (error) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`)
    }
}

const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsText(file)
    })
}

export const analyzeResumeWithGemini = async (resumeFile, jobDescription) => {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY
        
        if (!apiKey) {
            throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.')
        }

        const ai = new GoogleGenAI({ apiKey })
        
        let resumeContent

        if (resumeFile.type === 'application/pdf') {
            resumeContent = await extractTextFromPDF(resumeFile)
        } else if (resumeFile.type === 'text/plain') {
            resumeContent = await readTextFile(resumeFile)
        } else {
            throw new Error('Unsupported file type. Please upload a PDF or TXT file.')
        }

        const prompt = `Ти си експерт кариерен съветник и анализатор на резюмета. Анализирай предоставеното резюме спрямо даденото описание на работата и предостави детайлна, практически полезна обратна връзка.

Описание на работата:
${jobDescription}

Моля, предостави детайлна обратна връзка, покриваща:
1. **Обща оценка на съответствието**: Оцени съответствието на резюмето с работата (1-10) и обясни защо
2. **Ключови силни страни**: Подчертай какво прави този кандидат подходящ
3. **Липси и недостатъчни квалификации**: Идентифицирай липсващи умения, опит или квалификации
4. **Оптимизация на ключови думи**: Предложи важни ключови думи от описанието на работата, които трябва да бъдат добавени
5. **Конкретни препоръки**: Предостави практически предложения за подобряване на резюмето
6. **Форматиране и представяне**: Бележки относно структурата и представянето на резюмето

Бъди конкретен, конструктивен и се фокусирай върху практически подобрения. Форматирай отговора си на ясен, четим начин с правилни секции, използвайки markdown форматиране (заглавия, списъци, удебелен текст и т.н.).`

        const fullContent = `${prompt}\n\nResume Content:\n${resumeContent}`

        const modelNames = [
            'gemini-3-flash-preview',
            'gemini-2.0-flash-exp',
            'gemini-1.5-pro',
            'gemini-1.5-flash'
        ]
        
        let lastError = null

        for (const modelName of modelNames) {
            try {
                const stream = await ai.models.generateContentStream({
                    model: modelName,
                    contents: fullContent
                })
                
                return stream
            } catch (error) {
                lastError = error
                const errorMessage = error.message || error.toString()
                if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('not supported')) {
                    console.warn(`Model ${modelName} not available, trying next...`)
                    continue
                }
                throw error
            }
        }

        throw lastError || new Error(`No available Gemini model found. Tried: ${modelNames.join(', ')}. Please check your API key and model availability.`)
    } catch (error) {
        console.error('Error analyzing resume with Gemini:', error)
        throw error
    }
}

