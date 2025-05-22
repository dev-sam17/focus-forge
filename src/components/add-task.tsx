// components/AddTaskDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { NewTracker } from "../lib/types";

interface AddTaskDialogProps {
  onAddTask: (task: NewTracker) => void;
}

export default function AddTaskDialog({ onAddTask }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!taskName.trim()) return;

    const target_hours = parseFloat(targetHours) || 0;
    const newTask = {
      trackerName: taskName, 
      description,
      targetHours: target_hours,
    };

    onAddTask(newTask);
    setTaskName("");
    setTargetHours("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
          <span className="text-gray-500">Add New Tracker</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            type="text"
            placeholder="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Daily Target Hours (e.g. 4)"
            value={targetHours}
            onChange={(e) => setTargetHours(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Brief Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
