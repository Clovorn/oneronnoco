export default function KpiCard({ label, value, subtext, tone = 'light' }) {
  const styles = tone === 'dark'
    ? 'bg-gray-800 text-white border border-gray-700'
    : 'bg-white text-gray-900 border border-gray-200'

  return (
    <div className={`rounded-xl p-5 shadow-sm ${styles}`}>
      <p className={`text-sm ${tone === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtext && <p className={`text-xs mt-2 ${tone === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>{subtext}</p>}
    </div>
  )
}
