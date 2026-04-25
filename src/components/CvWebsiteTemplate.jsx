function CvWebsiteTemplate({ data }) {
    if (!data) return null

    const {
        fullName = '',
        title = '',
        location = '',
        email = '',
        phone = '',
        summary = '',
        skills = [],
        experience = [],
        education = [],
        projects = [],
        languages = []
    } = data

    return (
        <section className="max-w-6xl mx-auto px-4 mt-10">
            <div className="overflow-hidden rounded-3xl border border-[#175bbd]/15 shadow-2xl shadow-[#175bbd]/10 bg-white">
                <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#175bbd] text-white p-8 sm:p-12">
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                        {fullName || 'Your Name'}
                    </h2>
                    <p className="mt-3 text-lg sm:text-2xl text-white/90 font-semibold">
                        {title || 'Professional Title'}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3 text-sm">
                        {location && <span className="px-3 py-1 rounded-full bg-white/15">{location}</span>}
                        {email && <span className="px-3 py-1 rounded-full bg-white/15">{email}</span>}
                        {phone && <span className="px-3 py-1 rounded-full bg-white/15">{phone}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                    <aside className="lg:col-span-1 bg-[#f8f9fb] p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#2d3951]/10">
                        <h3 className="text-lg font-bold text-[#175bbd]">Skills</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {skills.length > 0 ? (
                                skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 text-sm rounded-full bg-[#175bbd]/10 text-[#175bbd] font-semibold">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-[#2d3951]/50 text-sm">No skills extracted yet.</p>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-[#175bbd] mt-8">Languages</h3>
                        <ul className="mt-3 space-y-2">
                            {languages.length > 0 ? (
                                languages.map((language, idx) => (
                                    <li key={idx} className="text-[#2d3951] font-medium">{language}</li>
                                ))
                            ) : (
                                <li className="text-[#2d3951]/50 text-sm">No languages extracted yet.</li>
                            )}
                        </ul>
                    </aside>

                    <div className="lg:col-span-2 p-6 sm:p-8">
                        <section>
                            <h3 className="text-2xl font-bold text-[#2d3951]">About</h3>
                            <p className="mt-3 text-[#2d3951]/80 leading-relaxed">
                                {summary || 'No summary extracted yet.'}
                            </p>
                        </section>

                        <section className="mt-8">
                            <h3 className="text-2xl font-bold text-[#2d3951]">Experience</h3>
                            <div className="mt-4 space-y-5">
                                {experience.length > 0 ? (
                                    experience.map((item, idx) => (
                                        <article key={idx} className="rounded-2xl border border-[#2d3951]/10 p-5 bg-white">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <h4 className="font-bold text-lg text-[#175bbd]">{item.role || 'Role'}</h4>
                                                <span className="text-sm text-[#2d3951]/60">{item.period || ''}</span>
                                            </div>
                                            <p className="text-[#2d3951] font-semibold mt-1">{item.company || ''}</p>
                                            <ul className="mt-3 list-disc list-inside text-[#2d3951]/80 space-y-1">
                                                {(item.highlights || []).map((h, hIdx) => (
                                                    <li key={hIdx}>{h}</li>
                                                ))}
                                            </ul>
                                        </article>
                                    ))
                                ) : (
                                    <p className="text-[#2d3951]/50">No experience extracted yet.</p>
                                )}
                            </div>
                        </section>

                        <section className="mt-8">
                            <h3 className="text-2xl font-bold text-[#2d3951]">Projects</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4">
                                {projects.length > 0 ? (
                                    projects.map((project, idx) => (
                                        <article key={idx} className="rounded-2xl border border-[#175bbd]/10 p-5 bg-[#175bbd]/[0.03]">
                                            <h4 className="font-bold text-lg text-[#175bbd]">{project.name || 'Project'}</h4>
                                            <p className="mt-2 text-[#2d3951]/80">{project.description || ''}</p>
                                            <p className="mt-3 text-sm text-[#2d3951]/70">
                                                {(project.technologies || []).join(' • ')}
                                            </p>
                                        </article>
                                    ))
                                ) : (
                                    <p className="text-[#2d3951]/50">No projects extracted yet.</p>
                                )}
                            </div>
                        </section>

                        <section className="mt-8">
                            <h3 className="text-2xl font-bold text-[#2d3951]">Education</h3>
                            <div className="mt-4 space-y-4">
                                {education.length > 0 ? (
                                    education.map((item, idx) => (
                                        <article key={idx} className="rounded-2xl border border-[#2d3951]/10 p-5">
                                            <h4 className="font-bold text-[#175bbd]">{item.degree || 'Degree'}</h4>
                                            <p className="text-[#2d3951]">{item.school || ''}</p>
                                            <p className="text-sm text-[#2d3951]/60 mt-1">{item.period || ''}</p>
                                        </article>
                                    ))
                                ) : (
                                    <p className="text-[#2d3951]/50">No education extracted yet.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CvWebsiteTemplate
