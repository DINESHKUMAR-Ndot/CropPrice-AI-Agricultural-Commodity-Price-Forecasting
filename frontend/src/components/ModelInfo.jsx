function ModelInfo({ info }) {
  if (!info) return null

  const { metrics, model_name, features, commodities } = info

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Model Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{model_name}</h3>
            <p className="text-sm text-gray-500">Trained on {features?.join(', ')} data</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex flex-wrap gap-6">
          {/* R2 Score */}
          <div className="text-center">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-green-600">
                {(metrics?.r2_score * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">R² Accuracy</p>
          </div>

          {/* MAE */}
          <div className="text-center">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-blue-600">
                ₹{metrics?.mae}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">MAE</p>
          </div>

          {/* RMSE */}
          <div className="text-center">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-purple-600">
                ₹{metrics?.rmse}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">RMSE</p>
          </div>

          {/* Commodities */}
          <div className="text-center">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-amber-600">
                {commodities?.length || 3}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Commodities</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-green-600 font-medium">Model Active</span>
        </div>
      </div>
    </div>
  )
}

export default ModelInfo
