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
  "name": "string",
  "initials": "string",
  "title": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "website": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "period": "string",
      "location": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "period": "string",
      "gpa": "string"
    }
  ],
  "languages": ["string"],
  "certifications": ["string"]
}
Правила:
- Ако липсва стойност, върни празен стринг "" или празен списък [].
- Не измисляй факти, които ги няма в CV.
- Отговори само с JSON обект.
- За initials използва първите две букви от името (в главни букви)
- За period използва формат "2021 – Сега" или "2019 – 2021"
- За gpa използва формат "5.80 / 6.00"
- В bullets използва конкретни постижения от резюмето

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

export async function filterJobsByCvWithGemini(cvData, jobs) {
    try {
        const ai = createGeminiClient()

        const prompt = `Ти си кариерен асистент. Съпостави CV с налични обяви за работа и върни САМО валиден JSON (без markdown, без обяснения, без текст извън JSON).

Схема на отговора:
{
  "results": [
    {
      "id": number,
      "score": number,
      "reasons": [string, string, string]
    }
  ]
}

Правила:
- Включвай ВСИЧКИ подадени обяви в "results" — дори несъответстващите (те получават нисък score).
- "score" е цяло число от 0 до 100, което отразява колко добре CV-то съответства на обявата.
  - 85–100: отлично съответствие
  - 65–84: добро съответствие
  - 45–64: частично съответствие
  - 0–44: слабо или без съответствие
- "reasons" е масив от ТОЧНО 3 кратки изречения на български — защо score-ът е такъв (силни страни и/или липси).
- id трябва да е точно id-то от подадената обява.
- Не измисляй нови id.
- Отговори само с JSON.

CV:
${JSON.stringify(cvData || {}, null, 2)}

Обяви:
${JSON.stringify((jobs || []).map(j => ({ id: j.id, title: j.title, company: j.company, desc: j.desc, tags: j.tags, level: j.level, type: j.type })), null, 2)}`

        const response = await generateContentWithFallback(ai, prompt)
        const responseText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const rawJson = extractJsonFromText(responseText)

        if (!rawJson) throw new Error('Could not extract JSON from model response.')

        const parsed = JSON.parse(rawJson)
        const results = Array.isArray(parsed?.results) ? parsed.results : []

        return results
            .filter(r => Number.isFinite(Number(r.id)))
            .map(r => ({
                id: Number(r.id),
                score: Math.min(100, Math.max(0, Math.round(Number(r.score) || 0))),
                reasons: Array.isArray(r.reasons) ? r.reasons.slice(0, 3) : [],
            }))
    } catch (error) {
        console.error('Error filtering jobs by CV with Gemini:', error)
        throw error
    }
}