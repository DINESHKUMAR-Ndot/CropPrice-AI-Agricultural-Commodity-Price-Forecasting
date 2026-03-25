function PredictionResult({ prediction, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 h-full">
        <div className="text-center py-8">
          <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Analyzing market data...</p>

          {/* Processing Steps */}
          <div className="mt-6 text-left max-w-xs mx-auto space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
              <span className="text-gray-600">Loading trained model...</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
              <span className="text-gray-600">Encoding commodity data...</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center animate-pulse">⋯</span>
              <span className="text-gray-600">Running Random Forest prediction...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md p-6 h-full flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center">
          <span className="text-6xl block mb-4">📈</span>
          <h3 className="text-xl font-semibold text-gray-700">Ready to Predict</h3>
          <p className="text-gray-500 mt-2">
            Select a commodity and enter quantity to get started
          </p>
        </div>
      </div>
    )
  }

  const commodityIcons = {
    'Wheat': '🌾',
    'Rice': '🍚',
    'Corn': '🌽'
  }

  // Calculate total price and per kg price
  const totalPrice = prediction.predicted_price * prediction.quantity
  const pricePerKg = prediction.predicted_price / 100  // 1 quintal = 100 kg

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
      {/* Header - Unit Price */}
      <div className="bg-gradient-crop text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Predicted Market Price</p>
            <p className="text-4xl font-bold mt-1">
              ₹{prediction.predicted_price.toLocaleString('en-IN')}
            </p>
            <p className="text-green-100 text-sm mt-1">per quintal (100 kg)</p>
          </div>
          <span className="text-5xl">{commodityIcons[prediction.commodity]}</span>
        </div>
      </div>

      {/* Per KG Price */}
      <div className="bg-green-50 border-b border-green-200 p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-green-700">Price per kg</span>
          <span className="text-lg font-bold text-green-800">
            ₹{pricePerKg.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/kg
          </span>
        </div>
      </div>

      {/* Total Price Banner */}
      <div className="bg-amber-50 border-b border-amber-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-amber-700">Total Value ({prediction.quantity} quintals)</p>
            <p className="text-2xl font-bold text-amber-800">
              ₹{totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-right text-sm text-amber-600">
            {prediction.quantity} × ₹{prediction.predicted_price.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Commodity</p>
            <p className="text-lg font-semibold text-gray-800">{prediction.commodity}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="text-lg font-semibold text-gray-800">{prediction.quantity} units</p>
          </div>
        </div>

        {/* Confidence Metrics */}
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Model Confidence</h4>
          <div className="space-y-3">
            {/* R2 Score */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Accuracy (R² Score)</span>
                <span className="font-semibold text-green-600">
                  {(prediction.confidence.r2_score * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${prediction.confidence.r2_score * 100}%` }}
                ></div>
              </div>
            </div>

            {/* MAE */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Mean Absolute Error</span>
              <span className="font-semibold text-gray-800">
                ±₹{prediction.confidence.mae}
              </span>
            </div>
          </div>
        </div>

        {/* Model Badge */}
        <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            {prediction.model}
          </span>
          <span>Machine Learning Model</span>
        </div>
      </div>
    </div>
  )
}

export default PredictionResult
