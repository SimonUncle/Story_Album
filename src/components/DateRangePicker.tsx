'use client'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-3">
        여행 기간 (선택)
      </label>
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30"
        />
        <span className="text-muted">~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30"
        />
      </div>
    </div>
  )
}
