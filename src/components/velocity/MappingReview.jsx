export default function MappingReview({ mapping, onChange }) {
  const fields = [
    'distributor_customer_id',
    'customer_name',
    'store_address',
    'route_name',
    'distributor_rep',
    'product_name',
    'product_sku',
    'product_category',
    'units_sold',
    'dollar_value',
    'unit_type',
  ]

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Mapping Review</h2>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div>
              <p className="text-sm font-medium text-gray-800">{field}</p>
            </div>
            <div>
              <input
                className="input"
                value={mapping?.[field] || ''}
                onChange={(e) => onChange(field, e.target.value || null)}
                placeholder="Mapped source column"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
