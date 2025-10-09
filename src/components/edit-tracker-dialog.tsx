"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Edit, Loader2 } from "lucide-react";
import type { Tracker } from "../lib/types";
import useApiClient from "../hooks/useApiClient";
import { useAuth } from "../contexts/AuthContext";

// Zod validation schema for edit tracker form
const editTrackerSchema = z.object({
  trackerName: z
    .string()
    .min(1, "Tracker name is required")
    .max(100, "Tracker name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  targetHours: z
    .number()
    .min(0.5, "Target hours must be at least 0.5")
    .max(24, "Target hours cannot exceed 24")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  workDays: z
    .string()
    .regex(/^(\d(,\d)*)?$/, "Invalid work days format")
    .optional()
    .or(z.literal("")),
});

type EditTrackerFormData = z.infer<typeof editTrackerSchema>;

interface EditTrackerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tracker: Tracker | null;
  onSuccess: () => void;
}

export default function EditTrackerDialog({
  isOpen,
  onClose,
  tracker,
  onSuccess,
}: EditTrackerDialogProps) {
  const [formData, setFormData] = useState<EditTrackerFormData>({
    trackerName: "",
    targetHours: 8,
    description: "",
    workDays: "",
  });
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user } = useAuth();
  const api = useApiClient(user?.id);

  // Days of the week
  const daysOfWeek = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];

  // Initialize form data when tracker changes
  useEffect(() => {
    if (tracker && isOpen) {
      setFormData({
        trackerName: tracker.trackerName,
        targetHours: tracker.targetHours,
        description: tracker.description || "",
        workDays: tracker.workDays,
      });

      // Parse work days
      const workDaysArray = tracker.workDays
        ? tracker.workDays.split(",").map(Number).filter(Boolean)
        : [];
      setSelectedDays(workDaysArray);
    }
  }, [tracker, isOpen]);

  // Update workDays string when selectedDays changes
  useEffect(() => {
    const workDaysString = selectedDays.sort().join(",");
    setFormData((prev) => ({ ...prev, workDays: workDaysString }));
  }, [selectedDays]);

  const handleDayToggle = (dayValue: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((day) => day !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleInputChange = (field: keyof EditTrackerFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    try {
      // Only validate fields that have values (since all are optional)
      const dataToValidate: Partial<EditTrackerFormData> = {};
      
      if (formData.trackerName && formData.trackerName.trim()) {
        dataToValidate.trackerName = formData.trackerName.trim();
      }
      
      if (formData.targetHours !== undefined) {
        dataToValidate.targetHours = formData.targetHours;
      }
      
      if (formData.description && formData.description.trim()) {
        dataToValidate.description = formData.description.trim();
      }
      
      if (formData.workDays) {
        dataToValidate.workDays = formData.workDays;
      }

      editTrackerSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tracker) return;

    if (!validateForm()) return;

    // Check if at least one field has been modified
    const hasChanges = 
      (formData.trackerName && formData.trackerName.trim() !== tracker.trackerName) ||
      (formData.targetHours !== undefined && formData.targetHours !== tracker.targetHours) ||
      (formData.description !== undefined && formData.description.trim() !== (tracker.description || "")) ||
      (formData.workDays !== undefined && formData.workDays !== tracker.workDays);

    if (!hasChanges) {
      setErrors({ general: "No changes detected. Please modify at least one field." });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare request body with only changed fields
      const requestBody: Partial<EditTrackerFormData> = {};
      
      if (formData.trackerName && formData.trackerName.trim() !== tracker.trackerName) {
        requestBody.trackerName = formData.trackerName.trim();
      }
      
      if (formData.targetHours !== undefined && formData.targetHours !== tracker.targetHours) {
        requestBody.targetHours = formData.targetHours;
      }
      
      if (formData.description !== undefined && formData.description.trim() !== (tracker.description || "")) {
        requestBody.description = formData.description.trim();
      }
      
      if (formData.workDays !== undefined && formData.workDays !== tracker.workDays) {
        requestBody.workDays = formData.workDays;
      }

      const response = await api(`/trackers/${tracker.id}/edit`, "PUT", requestBody);

      if (response.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          trackerName: "",
          targetHours: 8,
          description: "",
          workDays: "",
        });
        setSelectedDays([]);
      } else {
        setErrors({ general: response.error || "Failed to update tracker" });
      }
    } catch (error) {
      console.error("Error updating tracker:", error);
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setErrors({});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Tracker
          </DialogTitle>
          <DialogDescription>
            Update your tracker details. Only modified fields will be saved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Tracker Name */}
          <div className="space-y-2">
            <Label htmlFor="trackerName">Tracker Name</Label>
            <Input
              id="trackerName"
              type="text"
              value={formData.trackerName || ""}
              onChange={(e) => handleInputChange("trackerName", e.target.value)}
              placeholder="Enter tracker name"
              disabled={isLoading}
            />
            {errors.trackerName && (
              <p className="text-sm text-destructive">{errors.trackerName}</p>
            )}
          </div>

          {/* Target Hours */}
          <div className="space-y-2">
            <Label htmlFor="targetHours">Target Hours per Day</Label>
            <Input
              id="targetHours"
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={formData.targetHours || ""}
              onChange={(e) => handleInputChange("targetHours", parseFloat(e.target.value) || 0)}
              placeholder="8"
              disabled={isLoading}
            />
            {errors.targetHours && (
              <p className="text-sm text-destructive">{errors.targetHours}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter tracker description"
              rows={3}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Work Days */}
          <div className="space-y-2">
            <Label>Work Days</Label>
            <div className="grid grid-cols-2 gap-2">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={`day-${day.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.workDays && (
              <p className="text-sm text-destructive">{errors.workDays}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Tracker"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
