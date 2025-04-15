import type * as React from "react"

const Chart = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full h-full">{children}</div>
}

const ChartTooltip = ({ content }: { content: React.ReactNode }) => {
  return <>{content}</>
}

const ChartTooltipContent = ({ className, items }: { className?: string; items: any }) => {
  return (
    <div className={className}>
      {items &&
        items({ payload: [] }).map((item: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
            <span>{item.label}:</span>
            <span>{item.value}</span>
          </div>
        ))}
    </div>
  )
}

const ChartLegend = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex space-x-4">{children}</div>
}

const ChartLegendItem = ({ name, color }: { name: string; color: string }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
      <span>{name}</span>
    </div>
  )
}

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendItem }
