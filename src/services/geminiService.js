import { createGeminiClient, generateContentStreamWithFallback } from './geminiClient'
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