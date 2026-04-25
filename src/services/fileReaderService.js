import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export async function extractTextFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map(function (item) {
                return item.str
            }).join(' ')

            fullText += pageText + '\n\n'
        }

        return fullText.trim()
    } catch (error) {
        throw new Error('Failed to extract text from PDF: ' + error.message)
    }
}

export function readTextFile(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader()

        reader.onload = function () {
            resolve(reader.result)
        }

        reader.onerror = function () {
            reject(reader.error)
        }

        reader.readAsText(file)
    })
}

export async function extractResumeContent(file) {
    if (file.type === 'application/pdf') {
        return await extractTextFromPDF(file)
    }

    if (file.type === 'text/plain') {
        return await readTextFile(file)
    }

    throw new Error('Unsupported file type. Please upload a PDF or TXT file.')
}