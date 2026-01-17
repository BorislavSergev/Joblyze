import { Link } from 'react-router-dom'
import { HiHome, HiChartBar, HiInformationCircle, HiMail, HiHeart } from 'react-icons/hi'
import { FaBrain, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-[#2d3951]/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-12">
          <div className="lg:col-span-1">
            <Link 
              to="/"
              className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 hover:opacity-80 transition-opacity"
            >
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#175bbd] to-[#175bbd]/80 rounded-xl shadow-lg shadow-[#175bbd]/20">
                <FaBrain className="text-lg sm:text-xl text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-[#2d3951] tracking-tight">
                Joblyze
              </span>
            </Link>
            <p className="text-sm sm:text-base text-[#2d3951]/60 leading-relaxed mb-4 sm:mb-6">
              Трансформирайте обявите си за работа с помощта на изкуствен интелект. Получете практически обратна връзка и подобрете привличането на таланти.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5 rounded-xl hover:from-[#175bbd]/20 hover:to-[#175bbd]/10 text-[#175bbd] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#175bbd]/20"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5 rounded-xl hover:from-[#175bbd]/20 hover:to-[#175bbd]/10 text-[#175bbd] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#175bbd]/20"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-gradient-to-br from-[#175bbd]/10 to-[#175bbd]/5 rounded-xl hover:from-[#175bbd]/20 hover:to-[#175bbd]/10 text-[#175bbd] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#175bbd]/20"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#2d3951] mb-4 sm:mb-6">
              Навигация
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-2 text-sm sm:text-base text-[#2d3951]/70 hover:text-[#175bbd] transition-colors duration-300 group"
                >
                  <HiHome className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Начало</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/analyze"
                  className="flex items-center gap-2 text-sm sm:text-base text-[#2d3951]/70 hover:text-[#175bbd] transition-colors duration-300 group"
                >
                  <HiChartBar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Анализиране</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="flex items-center gap-2 text-sm sm:text-base text-[#2d3951]/70 hover:text-[#175bbd] transition-colors duration-300 group"
                >
                  <HiInformationCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>За нас</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#2d3951] mb-4 sm:mb-6">
              Ресурси
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[#2d3951]/70 hover:text-[#175bbd] transition-colors duration-300"
                >
                  Документация
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[#2d3951]/70 hover:text-[#175bbd] transition-colors duration-300"
                >
                  API Референция
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[#2d3951]/70 hover:text-[#175bbd] transition-colors duration-300"
                >
                  Често задавани въпроси
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[#2d3951]/70 hover:text-[#175bbd] transition-colors duration-300"
                >
                  Поддръжка
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#2d3951] mb-4 sm:mb-6">
              Контакт
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <a
                  href="mailto:contact@joblyze.com"
                  className="flex items-center gap-2 text-sm sm:text-base text-[#2d3951]/70 hover:text-[#175bbd] transition-colors duration-300 group"
                >
                  <HiMail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>contact@joblyze.com</span>
                </a>
              </li>
              <li className="text-sm sm:text-base text-[#2d3951]/60">
                Русе, България
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 sm:pt-10 border-t border-[#2d3951]/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <p className="text-sm sm:text-base text-[#2d3951]/60 text-center sm:text-left">
              © {currentYear} Joblyze. Всички права запазени.
            </p>
            <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-[#2d3951]/60">
              <span>Направено с</span>
              <HiHeart className="w-4 h-4 sm:w-5 sm:h-5 text-[#175bbd] animate-pulse" />
              <span>в България</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

