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
  setting: { key: string; value: any } | null;
  onSave: (key: string, value: any) => void;
  onCancel: () => void;
}

export function SystemSettingEditModal({
  open,
  setting,
  onSave,
  onCancel,
}: SystemSettingEditModalProps) {
  const [value, setValue] = useState(
    setting && typeof setting.value === "object"
      ? JSON.stringify(setting.value)
      : setting?.value ?? ""
  );

  const handleSave = () => {
    let parsed: any = value;
    try {
      parsed = JSON.parse(value);
    } catch {
      // keep string
    }
    if (setting) onSave(setting.key, parsed);
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
