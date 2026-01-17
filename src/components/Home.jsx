import { Link } from 'react-router-dom'
import { HiSparkles, HiArrowRight, HiUpload, HiClipboardCopy, HiLightningBolt, HiUsers, HiCheckCircle } from 'react-icons/hi'
import { FaBrain, FaFileUpload } from 'react-icons/fa'

function Home() {
  return (
    <div className="w-full">  
      <div className="text-center mb-20 sm:mb-24 lg:mb-32">
        <div className="inline-block mb-6 sm:mb-8 lg:mb-10">
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2d3951] mb-6 sm:mb-8 lg:mb-10 leading-tight tracking-tight px-4">
        Трансформирайте обявите си за работа
          <span className="block text-[#175bbd] mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-[#175bbd] to-[#175bbd]/80 rounded-xl sm:rounded-2xl shadow-xl shadow-[#175bbd]/25">
              <FaBrain className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
            </div>
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">с Изкуствен Интелект</span>
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-[#2d3951]/60 max-w-3xl mx-auto leading-relaxed font-normal mb-8 sm:mb-10 lg:mb-12 px-4">
        Joblyze използва напреднали алгоритми за анализ на обявите за работа и предоставя практически обратна връзка. Подобрете яснотата, приобщаването и ефективността, за да привлечете най-добрите кандидати.
        </p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-10 lg:px-12 py-3.5 sm:py-4 lg:py-5 bg-gradient-to-r from-[#175bbd] to-[#175bbd]/90 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-[#175bbd]/90 hover:to-[#175bbd]/80 transition-all duration-300 shadow-2xl shadow-[#175bbd]/30 hover:shadow-[#175bbd]/40 hover:-translate-y-1 active:translate-y-0"
        >
          Започнете
          <HiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto mb-20 sm:mb-24 lg:mb-32 px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="group bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[#2d3951]/5 hover:border-[#175bbd]/20 transition-all duration-500 hover:shadow-2xl hover:shadow-[#175bbd]/10 hover:-translate-y-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500">
              <FaBrain className="w-8 h-8 sm:w-10 sm:h-10 text-[#175bbd]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#2d3951] mb-4 sm:mb-5">Анализиране с Изкуствен Интелект</h3>
            <p className="text-[#2d3951]/60 leading-relaxed text-sm sm:text-base">
            Нашите напреднали алгоритми за изкуствен интелект анализират обявите за работа за яснота, тон и ефективност.
            </p>
          </div>

          <div className="group bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[#2d3951]/5 hover:border-[#175bbd]/20 transition-all duration-500 hover:shadow-2xl hover:shadow-[#175bbd]/10 hover:-translate-y-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500">
              <HiUsers className="w-8 h-8 sm:w-10 sm:h-10 text-[#175bbd]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#2d3951] mb-4 sm:mb-5">Проверка на приобщаване</h3>
            <p className="text-[#2d3951]/60 leading-relaxed text-sm sm:text-base">
            Нашите алгоритми за изкуствен интелект проверяват дали обявите за работа са приобщаващи и привлекателни за разнообразни кандидати с откриване на потенциални предразсъдъци.
            </p>
          </div>

          <div className="group bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[#2d3951]/5 hover:border-[#175bbd]/20 transition-all duration-500 hover:shadow-2xl hover:shadow-[#175bbd]/10 hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500">
              <HiLightningBolt className="w-8 h-8 sm:w-10 sm:h-10 text-[#175bbd]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#2d3951] mb-4 sm:mb-5">Мигновена обратна връзка</h3>
            <p className="text-[#2d3951]/60 leading-relaxed text-sm sm:text-base">
            Нашите алгоритми за изкуствен интелект предоставят детайлна обратна връзка в секунди с практически препоръки за подобряване на обявите за работа.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2d3951] text-center mb-10 sm:mb-12 lg:mb-16 tracking-tight">
          Как работи Joblyze
        </h2>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-start p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl border border-[#2d3951]/5 hover:border-[#175bbd]/20 hover:shadow-xl transition-all duration-300">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#175bbd] to-[#175bbd]/80 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#175bbd]/25">
              <HiUpload className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2d3951] mb-2 sm:mb-3">Качване или pasting</h3>
              <p className="text-[#2d3951]/60 text-base sm:text-lg leading-relaxed">
                Просто качете файл с обявата за работа или копирайте текста директно в нашия анализатор.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-start p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl border border-[#2d3951]/5 hover:border-[#175bbd]/20 hover:shadow-xl transition-all duration-300">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#175bbd] to-[#175bbd]/80 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#175bbd]/25">
              <FaBrain className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2d3951] mb-2 sm:mb-3">Анализиране с Изкуствен Интелект</h3>
              <p className="text-[#2d3951]/60 text-base sm:text-lg leading-relaxed">
                Нашите алгоритми за изкуствен интелект анализират обявите за работа за яснота, приобщаване, структура и ефективност.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-start p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl border border-[#2d3951]/5 hover:border-[#175bbd]/20 hover:shadow-xl transition-all duration-300">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#175bbd] to-[#175bbd]/80 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#175bbd]/25">
              <HiCheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2d3951] mb-2 sm:mb-3">Получаване на обратна връзка</h3>
              <p className="text-[#2d3951]/60 text-base sm:text-lg leading-relaxed">
                Нашите алгоритми за изкуствен интелект предоставят детайлна обратна връзка с конкретни препоръки за подобряване на обявите за работа.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home


