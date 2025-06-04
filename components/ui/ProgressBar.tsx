type ProgressBarProps = {
  percent: number; // 0 to 100
  height?: number; // px
};

export function ProgressBar({ percent, height = 16 }: ProgressBarProps) {
  return (
    <div className="w-full border rounded overflow-hidden" style={{ height }}>
      <div
        className="bg-green-500 h-full transition-all"
        style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
      />
    </div>
  );
}
