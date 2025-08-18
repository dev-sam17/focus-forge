// Anime-styled Add Task Dialog Component
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
import { Toggle } from "./ui/toggle";
import { NewTracker } from "../lib/types";
import { Plus, Sparkles, Target, Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AddTaskDialogProps {
  onAddTask: (task: NewTracker) => void;
}

export default function AddTaskDialog({ onAddTask }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri by default

  const { user } = useAuth();

  const daysOfWeek = [
    { value: 0, label: "S" },
    { value: 1, label: "M" },
    { value: 2, label: "T" },
    { value: 3, label: "W" },
    { value: 4, label: "T" },
    { value: 5, label: "F" },
    { value: 6, label: "S" },
  ];

  const handleSubmit = () => {
    if (!taskName.trim()) return;

    const target_hours = parseFloat(targetHours) || 0;
    const newTask = {
      trackerName: taskName,
      description,
      targetHours: target_hours,
      workDays: selectedDays.join(","),
      userId: user?.id,
    };

    onAddTask(newTask);
    setTaskName("");
    setTargetHours("");
    setDescription("");
    setSelectedDays([1, 2, 3, 4, 5]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="group flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 anime-glow"
          title="Add New Tracker"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </DialogTrigger>

      <DialogContent className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl max-w-md mx-auto">
        <DialogHeader className="bg-gradient-to-r from-primary/20 to-accent/20 -m-6 mb-6 p-6 rounded-t-lg border-b border-border/30">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            Create New Tracker
            <Sparkles className="w-5 h-5 text-primary" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Name Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Target className="w-4 h-4" />
              <span>Task Details</span>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Enter task name..."
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="bg-background border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
              <Input
                placeholder="Description (optional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background border-accent/30 focus:border-accent text-foreground placeholder:text-muted-foreground"
              />
              <Input
                placeholder="Target hours per day (optional)..."
                value={targetHours}
                onChange={(e) => setTargetHours(e.target.value)}
                type="number"
                min="0"
                step="0.5"
                className="bg-background border-success/30 focus:border-success text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Work Days Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Calendar className="w-4 h-4" />
              <span>Work Days</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <Toggle
                  key={day.value}
                  pressed={selectedDays.includes(day.value)}
                  onPressedChange={(pressed) => {
                    if (pressed) {
                      setSelectedDays([...selectedDays, day.value]);
                    } else {
                      setSelectedDays(
                        selectedDays.filter((d) => d !== day.value)
                      );
                    }
                  }}
                  className="h-10 w-full bg-background border border-border/30 data-[state=on]:bg-gradient-to-r data-[state=on]:from-primary data-[state=on]:to-accent data-[state=on]:text-white data-[state=on]:border-transparent transition-all duration-200 hover:scale-105 text-foreground"
                >
                  {day.label}
                </Toggle>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="bg-background border-border/50 hover:bg-muted/30 text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!taskName.trim()}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Tracker
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
