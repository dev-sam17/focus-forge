"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, Trash2 } from "lucide-react";
import type { Tracker } from "../lib/types";

interface ArchivedTrackerProps {
  task: Tracker;
  onDelete: (taskId: string) => void;
}

export default function ArchivedTracker({
  task,
  onDelete,
}: ArchivedTrackerProps) {
  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this tracker?")) {
      onDelete(task.id);
    }
  };

  return (
    <Card className="overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
      <CardHeader className="bg-gray-100">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.tracker_name}</CardTitle>
          <Badge variant="outline">Archived</Badge>
        </div>
        <p className="text-sm text-gray-500">{task.description}</p>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-2 h-4 w-4" />
            <span>Daily Target: </span>
            <span className="ml-1 font-medium">{task.target_hours} hours</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-100 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
        </Button>
      </CardFooter>
    </Card>
  );
}
