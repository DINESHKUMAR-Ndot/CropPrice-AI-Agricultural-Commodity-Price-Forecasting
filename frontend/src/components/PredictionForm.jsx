import { useState } from 'react'

const commodities = [
  { id: 'Wheat', name: 'Wheat', icon: '🌾', color: 'amber' },
  { id: 'Rice', name: 'Rice', icon: '🍚', color: 'green' },
  { id: 'Corn', name: 'Corn', icon: '🌽', color: 'yellow' },
]

function PredictionForm({ onPredict, loading }) {
  const [quantity, setQuantity] = useState('')
  const [commodity, setCommodity] = useState('Wheat')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (quantity && commodity) {
      onPredict(quantity, commodity)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Price Prediction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Commodity Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Commodity
          </label>
          <div className="grid grid-cols-3 gap-3">
            {commodities.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCommodity(item.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  commodity === item.id
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-3xl block mb-1">{item.icon}</span>
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Quantity (in Quintals)
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quintals (e.g., 10)"
            min="1"
            max="1000"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">1 Quintal = 100 kg | Enter value between 1-1000</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !quantity}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            loading || !quantity
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Predicting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🔮 Predict Price
            </span>
          )}
        </button>
      </form>
    </div>
  )
}

export default PredictionForm
