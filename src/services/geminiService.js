import { createGeminiClient, generateContentStreamWithFallback, generateContentWithFallback } from './geminiClient'
import { extractResumeContent } from './fileReaderService'

export async function analyzeResumeWithGemini(resumeFile, jobDescription) {
    try {
        const ai = createGeminiClient()
        const resumeContent = await extractResumeContent(resumeFile)

        const prompt = `Забрави всички предишни взаимодействия. Това е нов, независим анализ за нов кандидат. Не използвай информация от предишни анализи или потребители.

Ти си експерт кариерен съветник и анализатор на резюмета. Анализирай предоставеното резюме спрямо даденото описание на работата и предостави детайлна, практически полезна обратна връзка.

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

        const fullContent = prompt + '\n\nResume Content:\n' + resumeContent

        const stream = await generateContentStreamWithFallback(ai, fullContent)

        return stream
    } catch (error) {
        console.error('Error analyzing resume with Gemini:', error)
        throw error
    }
}

function extractJsonFromText(text) {
    if (!text) return null

    const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i)
    if (fencedMatch?.[1]) {
        return fencedMatch[1]
    }

    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
        return text.slice(jsonStart, jsonEnd + 1)
    }

    return null
}

export async function buildCvWebsiteDataWithGemini(resumeFile) {
    try {
        const ai = createGeminiClient()
        const resumeContent = await extractResumeContent(resumeFile)

        const prompt = `Извлечи структурирани данни от предоставеното CV и върни САМО валиден JSON (без markdown, без обяснения).

Използвай точно тази схема:
{
  "fullName": "string",
  "title": "string",
  "location": "string",
  "email": "string",
  "phone": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "period": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "period": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ],
  "languages": ["string"]
}

Правила:
- Ако липсва стойност, върни празен стринг "" или празен списък [].
- Не измисляй факти, които ги няма в CV.
- Отговори само с JSON обект.

Resume Content:
${resumeContent}`

        const response = await generateContentWithFallback(ai, prompt)
        const responseText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const rawJson = extractJsonFromText(responseText)

        if (!rawJson) {
            throw new Error('Could not extract JSON from model response.')
        }

        return JSON.parse(rawJson)
    } catch (error) {
        console.error('Error building CV website data with Gemini:', error)
        throw error
    }
}