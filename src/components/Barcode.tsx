interface BarcodeProps {
  height?: number
  className?: string
}

export const Barcode = ({ height = 80, className = '' }: BarcodeProps) => {
  // Barcode pattern - mix of thin and thick bars (1 = thin, 2 = medium, 3 = thick)
  const pattern = [1, 2, 1, 1, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 1]

  const viewBoxWidth = 200
  const totalUnits = pattern.reduce((sum, val) => sum + val, 0)
  const unitWidth = viewBoxWidth / totalUnits

  let currentX = 0

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${viewBoxWidth} ${height}`}
      preserveAspectRatio="none"
      className={className}
    >
      {pattern.map((barWidth, index) => {
        const x = currentX
        const w = barWidth * unitWidth
        currentX += w

        // Only render white bars (every other bar)
        if (index % 2 === 0) {
          return <rect key={index} x={x} y={0} width={w} height={height} className="fill-amber-700" />
        }
        return null
      })}
    </svg>
  )
}
