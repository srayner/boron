import { useState } from "react";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SystemSettingEditModalProps {
  open: boolean;
  setting: { key: string; value: unknown } | null;
  onSave: (key: string, value: unknown) => void;
  onCancel: () => void;
}

export function SystemSettingEditModal({
  open,
  setting,
  onSave,
  onCancel,
}: SystemSettingEditModalProps) {
  const [value, setValue] = useState<string>(
    setting && typeof setting.value === "object"
      ? JSON.stringify(setting.value)
      : String(setting?.value ?? "")
  );

  const handleSave = () => {
    if (!setting) return;

    let parsed: unknown = value;
    try {
      // if original value was an object, try parsing JSON back
      if (typeof setting.value === "object") {
        parsed = JSON.parse(value as string);
      }
    } catch {
      // fallback to raw string if parse fails
      parsed = value;
    }

    onSave(setting.key, parsed);
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {setting?.key}</DialogTitle>
        </DialogHeader>

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-4"
        />

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
