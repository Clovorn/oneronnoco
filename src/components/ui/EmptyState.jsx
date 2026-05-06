export default function EmptyState({ title, description, action }) {
  return (
    <div className="card text-center py-12">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
