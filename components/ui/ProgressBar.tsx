type ProgressBarProps = {
  percent: number; // 0 to 100
};

export function ProgressBar({ percent }: ProgressBarProps) {
  return (
    <div className="w-full border rounded h-4 overflow-hidden">
      <div
        className="bg-green-500 h-full transition-all"
        style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
      />
    </div>
  );
}
