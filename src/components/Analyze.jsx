import { useState, useEffect } from 'react'
import { HiUpload, HiClipboardCopy, HiX, HiSparkles } from 'react-icons/hi'
import { FaFileUpload, FaCheckCircle } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import { analyzeResumeWithGemini } from '../services/geminiService'


function Analyze() {
    const [resumeFile, setResumeFile] = useState(null)
    const [resumeName, setResumeName] = useState('')
    const [resumeDragging, setResumeDragging] = useState(false)
    const [jdText, setJdText] = useState('')
    const [feedback, setFeedback] = useState('')
    const [loading, setLoading] = useState(false)
    const handleResumeDragOver = (e) => {
        e.preventDefault()
        setResumeDragging(true)
    }
    const handleResumeDragLeave = (e) => {
        e.preventDefault()
        setResumeDragging(false)
    }
    const handleResumeDrop = (e) => {
        e.preventDefault()
        setResumeDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain')) {
            setResumeFile(droppedFile)
            setResumeName(droppedFile.name)
        }
    }
    const handleResumeChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
            setResumeFile(selectedFile)
            setResumeName(selectedFile.name)
        }
    }
    const handleResumeClear = () => {
        setResumeFile(null)
        setResumeName('')
    }

    const handleJdTextChange = (e) => {
        setJdText(e.target.value)
    }
    const handleJdClear = () => {
        setJdText('')
    }

    const handleSubmit = async () => {
        if (!resumeFile || !jdText.trim()) return
        setLoading(true)
        setFeedback('')
        
        try {
            const stream = await analyzeResumeWithGemini(resumeFile, jdText)
            
            let accumulatedText = ''
            let buffer = ''
            let firstChunkReceived = false
            
            for await (const chunk of stream) {
                let chunkText = ''
                
                if (typeof chunk === 'string') {
                    chunkText = chunk
                } else if (chunk?.text) {
                    chunkText = chunk.text
                } else if (chunk?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    chunkText = chunk.candidates[0].content.parts[0].text
                } else if (chunk?.delta?.text) {
                    chunkText = chunk.delta.text
                }
                
                if (chunkText) {
                    if (!firstChunkReceived) {
                        firstChunkReceived = true
                        setLoading(false)
                    }
                    
                    buffer += chunkText
                    
                    const words = buffer.split(/(\s+)/)
                    buffer = words.pop() || ''
                    
                    for (const word of words) {
                        accumulatedText += word
                        setFeedback(accumulatedText)
                        await new Promise(resolve => setTimeout(resolve, 30))
                    }
                }
            }
            
            if (buffer) {
                accumulatedText += buffer
                setFeedback(accumulatedText)
            }
        } catch (error) {
            console.error('Analysis error:', error)
            setFeedback(`Грешка: ${error.message || 'Неуспешно анализиране на резюмето. Моля, проверете вашия API ключ и опитайте отново.'}`)
        } finally {
            setLoading(false)
        }
    }
    const handleClearAll = () => {
        handleResumeClear()
        handleJdClear()
        setFeedback('')
    }

    useEffect(() => {
        if (loading) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [loading])

    return (
        <div className="w-full relative">
            {loading && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md mx-4 flex flex-col items-center gap-6">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                            <div className="absolute inset-0 border-4 border-[#175bbd]/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-transparent border-t-[#175bbd] rounded-full animate-spin"></div>
                            <div className="absolute inset-2 border-4 border-transparent border-r-[#175bbd]/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#2d3951] mb-2 flex items-center justify-center gap-2">
                                <HiSparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#175bbd] animate-pulse" />
                                <span>AI мисли...</span>
                            </h3>
                            <p className="text-sm sm:text-base text-[#2d3951]/60">
                                Моля, изчакайте докато анализираме вашето резюме
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="text-center mb-16 sm:mb-20 lg:mb-28 px-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2d3951] mb-6 sm:mb-8 lg:mb-10 leading-tight tracking-tight">
                    Анализиране
                    <span className="block text-[#175bbd] mt-3 sm:mt-4">
                    Получете персонализирана обратна връзка с AI
                    </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#2d3951]/60 max-w-2xl mx-auto leading-relaxed font-normal">
                Качете автобиографията си и описание на длъжността, за да получите практическа обратна връзка, задвижвана от изкуствен интелект, относно вашата пригодност и предложения за подобрение.
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div>
                    <h2 className="text-lg font-bold text-[#2d3951] mb-4 flex items-center gap-2">
                        <FaFileUpload className="w-5 h-5 text-[#175bbd]" /> Резюме
                    </h2>
                    <div
                        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-500 ${resumeDragging
                            ? 'border-[#175bbd] bg-gradient-to-br from-[#175bbd]/5 to-[#175bbd]/2 scale-[1.01] shadow-2xl shadow-[#175bbd]/25'
                            : 'border-[#2d3951]/10 bg-white hover:border-[#175bbd]/30 hover:shadow-2xl hover:shadow-[#175bbd]/10'
                        }`}
                        onDragOver={handleResumeDragOver}
                        onDragLeave={handleResumeDragLeave}
                        onDrop={handleResumeDrop}
                    >
                        <div className="text-center">
                            <div className="mb-6">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-all duration-500 ${resumeDragging
                                    ? 'bg-gradient-to-br from-[#175bbd] to-[#175bbd]/80 scale-110 shadow-2xl shadow-[#175bbd]/40'
                                    : 'bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5'
                                }`}>
                                    <FaFileUpload
                                        className={`w-8 h-8 transition-colors duration-500 ${resumeDragging ? 'text-white' : 'text-[#175bbd]'}`}
                                    />
                                </div>
                            </div>
                            <p className="text-base font-bold text-[#2d3951] mb-2">
                                {resumeFile ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <FaCheckCircle className="w-4 h-4 text-[#175bbd]" />
                                        <span className="text-[#175bbd] text-sm break-all">{resumeName}</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2 text-sm">
                                        <HiUpload className="w-4 h-4" />
                                        Качване или плъзгане на резюмето (.pdf или .txt)
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-[#2d3951]/60 mb-6 font-medium">
                                Поддържа .pdf, .txt • Максимален размер 10MB
                            </p>
                            <label className="inline-block">
                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#175bbd] to-[#175bbd]/90 text-white rounded-xl font-bold text-sm cursor-pointer hover:from-[#175bbd]/90 hover:to-[#175bbd]/80 transition-all duration-300 shadow-2xl shadow-[#175bbd]/30 hover:shadow-[#175bbd]/40 hover:-translate-y-1 active:translate-y-0">
                                    <HiUpload className="w-4 h-4" />
                                    Изберете резюме
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={handleResumeChange}
                                    className="hidden"
                                />
                            </label>
                            {resumeFile && (
                                <button
                                    onClick={handleResumeClear}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-[#2d3951]/10 text-[#2d3951] rounded-xl font-bold text-xs hover:bg-[#f8f9fb] hover:border-[#2d3951]/20 transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                    <HiX className="w-4 h-4" /> Изчистване
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-[#2d3951] mb-4 flex items-center gap-2">
                        <HiClipboardCopy className="w-5 h-5 text-[#175bbd]" /> Описание на работата
                    </h2>
                    <div className="mt-6">
                        <div className="relative">
                            <textarea
                                value={jdText}
                                onChange={handleJdTextChange}
                                placeholder="Копирайте текста на обявата за работа тук..."
                                className="w-full h-40 p-4 border border-[#2d3951]/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#175bbd]/20 focus:border-[#175bbd] resize-none text-[#2d3951] bg-white placeholder-[#2d3951]/40 transition-all duration-300 font-normal text-sm leading-relaxed hover:border-[#175bbd]/20 shadow-sm hover:shadow-lg"
                            />
                            {jdText && (
                                <div className="absolute top-3 right-3">
                                    <span className="text-[10px] font-bold text-[#2d3951]/60 bg-[#f8f9fb] px-2 py-1 rounded-lg border border-[#2d3951]/10">
                                        {jdText.length} символа
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end max-w-5xl mx-auto px-4 mb-8">
                {(resumeFile || jdText) && (
                    <button
                        onClick={handleClearAll}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#2d3951]/10 text-[#2d3951] rounded-xl font-bold text-sm hover:bg-[#f8f9fb] hover:border-[#2d3951]/20 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <HiX className="w-4 h-4" /> Изчистване на всички
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={!resumeFile || !jdText.trim() || loading}
                    className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${resumeFile && jdText.trim() && !loading
                        ? 'bg-gradient-to-r from-[#175bbd] to-[#175bbd]/90 text-white hover:from-[#175bbd]/90 hover:to-[#175bbd]/80 cursor-pointer shadow-2xl shadow-[#175bbd]/30 hover:shadow-[#175bbd]/40 hover:-translate-y-1 active:translate-y-0'
                        : 'bg-[#2d3951]/5 text-[#2d3951]/30 cursor-not-allowed border border-[#2d3951]/10'
                    }`}
                >
                    <HiSparkles className="w-4 h-4" />
                    {loading ? 'Анализиране...' : 'Анализиране'}
                </button>
            </div>

            {feedback && (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 bg-white border border-[#175bbd]/10 rounded-2xl shadow-lg text-[#2d3951]">
                    <h3 className="font-bold text-lg mb-4 text-[#175bbd] flex items-center gap-2">
                        <HiSparkles className="w-5 h-5" />
                        Обратна връзка с AI
                    </h3>
                    <div className="prose prose-sm max-w-none text-[#2d3951] leading-relaxed">
                        <ReactMarkdown
                            components={{
                                h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-[#2d3951]" {...props} />,
                                h2: ({ ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-[#2d3951]" {...props} />,
                                h3: ({ ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-[#175bbd]" {...props} />,
                                h4: ({ ...props }) => <h4 className="text-base font-bold mt-3 mb-2 text-[#2d3951]" {...props} />,
                                p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 ml-4" {...props} />,
                                ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 ml-4" {...props} />,
                                li: ({ ...props }) => <li className="mb-1" {...props} />,
                                strong: ({ ...props }) => <strong className="font-bold text-[#175bbd]" {...props} />,
                                em: ({ ...props }) => <em className="italic" {...props} />,
                                hr: ({ ...props }) => <hr className="my-6 border-[#2d3951]/20" {...props} />,
                                blockquote: ({ ...props }) => <blockquote className="border-l-4 border-[#175bbd] pl-4 italic my-4 text-[#2d3951]/80" {...props} />,
                            }}
                        >
                            {feedback}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Analyze

