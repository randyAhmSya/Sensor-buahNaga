interface HarvestProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
}

export function HarvestProgressRing({
  progress,
  size = 110,
  strokeWidth = 10,
}: HarvestProgressRingProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedProgress / 100) * circumference

  const getColor = () => {
    if (clampedProgress >= 90) return 'text-emerald-500 stroke-emerald-500'
    if (clampedProgress >= 50) return 'text-amber-500 stroke-amber-500'
    return 'text-sky-500 stroke-sky-500'
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="text-slate-100 stroke-slate-200"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`transition-all duration-700 ease-out ${getColor()}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-lg font-extrabold text-slate-900 tracking-tight">
          {clampedProgress.toFixed(0)}%
        </span>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          Target
        </span>
      </div>
    </div>
  )
}
