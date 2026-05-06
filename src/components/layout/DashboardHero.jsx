export default function DashboardHero({ title, subtitle, actions, dark = true }) {
  return (
    <div className={`rounded-2xl p-6 md:p-8 ${dark ? 'bg-secondary text-white' : 'bg-white border border-gray-200'} shadow-sm`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
          {subtitle && <p className={`mt-2 text-sm md:text-base ${dark ? 'text-gray-300' : 'text-gray-500'}`}>{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  )
}
