function MetricCard({ value, label, suffix = '' }) {
  return (
    <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <span className="text-2xl sm:text-3xl font-extrabold text-green-700">
        {value}
        {suffix}
      </span>
      <span className="text-sm text-gray-600 mt-1">{label}</span>
    </div>
  )
}

export default MetricCard