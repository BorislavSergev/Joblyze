import { FaBrain, FaUsers, FaRocket } from 'react-icons/fa'
import { HiInformationCircle } from 'react-icons/hi'

function About() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="text-center mb-12 sm:mb-16 lg:mb-20">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-lg">
          <HiInformationCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#175bbd]" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2d3951] mb-6 sm:mb-8 lg:mb-10 leading-tight tracking-tight">About Joblyze</h1>
        <p className="text-base sm:text-lg md:text-xl text-[#2d3951]/60 max-w-3xl mx-auto leading-relaxed font-normal">
          Joblyze е платформа, задвижвана от изкуствен интелект, предназначена да помогне на специалистите по подбор на персонал и HR специалистите да създават по-добри длъжностни характеристики. Нашите усъвършенствани алгоритми анализират обявите за работа за яснота, приобщаване и ефективност, предоставяйки практическа обратна връзка, за да ви помогнат да привлечете най-добрите кандидати.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-12 lg:mt-16">
        <div className="group text-center p-6 sm:p-8 lg:p-10 bg-white rounded-2xl sm:rounded-3xl border border-[#2d3951]/5 hover:border-[#175bbd]/20 hover:shadow-2xl hover:shadow-[#175bbd]/10 hover:-translate-y-2 transition-all duration-500">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
            <FaBrain className="w-7 h-7 sm:w-8 sm:h-8 text-[#175bbd]" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2d3951] mb-2 sm:mb-3">AI-Powered</h3>
          <p className="text-sm sm:text-base text-[#2d3951]/60 leading-relaxed">Advanced machine learning algorithms</p>
        </div>
        <div className="group text-center p-6 sm:p-8 lg:p-10 bg-white rounded-2xl sm:rounded-3xl border border-[#2d3951]/5 hover:border-[#175bbd]/20 hover:shadow-2xl hover:shadow-[#175bbd]/10 hover:-translate-y-2 transition-all duration-500">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
            <FaUsers className="w-7 h-7 sm:w-8 sm:h-8 text-[#175bbd]" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2d3951] mb-2 sm:mb-3">For Everyone</h3>
          <p className="text-sm sm:text-base text-[#2d3951]/60 leading-relaxed">Designed for recruiters and HR teams</p>
        </div>
        <div className="group text-center p-6 sm:p-8 lg:p-10 bg-white rounded-2xl sm:rounded-3xl border border-[#2d3951]/5 hover:border-[#175bbd]/20 hover:shadow-2xl hover:shadow-[#175bbd]/10 hover:-translate-y-2 transition-all duration-500 sm:col-span-2 lg:col-span-1">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
            <FaRocket className="w-7 h-7 sm:w-8 sm:h-8 text-[#175bbd]" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2d3951] mb-2 sm:mb-3">Fast & Easy</h3>
          <p className="text-sm sm:text-base text-[#2d3951]/60 leading-relaxed">Get results in seconds</p>
        </div>
      </div>
    </div>
  )
}

export default About

