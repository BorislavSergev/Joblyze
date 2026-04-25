import { useMemo } from 'react'
import { HiSparkles, HiCode, HiClipboardCopy } from 'react-icons/hi'
import ReactMarkdown from 'react-markdown'

function toSimpleHtml(markdown) {
    if (!markdown) return ''

    return markdown
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*)$/gm, '<h1>$1</h1>')
        .replace(/^\- (.*)$/gm, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .split('\n')
        .map((line) => {
            if (!line.trim()) return ''
            if (line.startsWith('<h') || line.startsWith('<li>')) return line
            return `<p>${line}</p>`
        })
        .join('\n')
        .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
        .replace(/<\/ul>\s*<ul>/g, '')
}

function Templates({ feedback }) {
    const htmlPreview = useMemo(() => toSimpleHtml(feedback), [feedback])

    const copyHtml = async () => {
        if (!htmlPreview) return
        await navigator.clipboard.writeText(htmlPreview)
    }

    if (!feedback) {
        return (
            <section className="max-w-5xl mx-auto px-4">
                <div className="bg-white border border-[#175bbd]/10 rounded-2xl shadow-lg p-8 sm:p-10 text-center">
                    <h3 className="font-bold text-xl text-[#175bbd] flex items-center justify-center gap-2">
                        <HiSparkles className="w-5 h-5" />
                        Templates
                    </h3>
                    <p className="mt-4 text-[#2d3951]/70 max-w-2xl mx-auto leading-relaxed">
                        Все още няма генериран анализ. Качи CV и описание на работа в секцията
                        Analyze, след което тук ще видиш готовия template и HTML output.
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-5xl mx-auto px-4">
            <div className="bg-white border border-[#175bbd]/10 rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2d3951]/10 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-bold text-lg text-[#175bbd] flex items-center gap-2">
                        <HiSparkles className="w-5 h-5" />
                        Templates
                    </h3>
                    <button
                        onClick={copyHtml}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#175bbd]/10 text-[#175bbd] hover:bg-[#175bbd]/20 transition-colors"
                    >
                        <HiClipboardCopy className="w-4 h-4" />
                        Copy HTML
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#2d3951]/10">
                        <h4 className="font-bold text-[#2d3951] mb-3 flex items-center gap-2">
                            <HiSparkles className="w-4 h-4 text-[#175bbd]" />
                            AI Feedback Template
                        </h4>
                        <div className="prose prose-sm max-w-none text-[#2d3951] leading-relaxed">
                            <ReactMarkdown
                                components={{
                                    h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-[#2d3951]" {...props} />,
                                    h2: ({ ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-[#175bbd]" {...props} />,
                                    h3: ({ ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-[#2d3951]" {...props} />,
                                    p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                    ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 ml-4" {...props} />,
                                    li: ({ ...props }) => <li className="mb-1" {...props} />,
                                    strong: ({ ...props }) => <strong className="font-bold text-[#175bbd]" {...props} />
                                }}
                            >
                                {feedback}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <div className="p-6 bg-[#f8f9fb]">
                        <h4 className="font-bold text-[#2d3951] mb-3 flex items-center gap-2">
                            <HiCode className="w-4 h-4 text-[#175bbd]" />
                            HTML Output
                        </h4>
                        <pre className="w-full max-h-[520px] overflow-auto rounded-xl p-4 bg-[#0b1020] text-[#d5e2ff] text-xs leading-relaxed">
                            <code>{htmlPreview}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Templates
