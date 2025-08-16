"use client";

// Anime-styled Archived Tracker Component

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, Trash2, Archive } from "lucide-react";
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
    <Card className="anime-card glass border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 group overflow-hidden opacity-75 hover:opacity-100">
      {/* Subtle gradient border for archived state */}
      <div className="absolute inset-0 bg-gradient-to-r from-muted/20 via-muted-foreground/10 to-muted/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-card rounded-xl m-px">
        
        <CardHeader className="bg-gradient-to-r from-muted/10 to-muted-foreground/5 p-4 border-b border-border/30">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-muted-foreground">{task.trackerName}</CardTitle>
              <p className="text-sm text-muted-foreground/70 line-clamp-2">{task.description}</p>
            </div>
            <Badge 
              variant="outline" 
              className="border-muted-foreground/30 text-muted-foreground bg-muted/20 flex items-center gap-1"
            >
              <Archive className="w-3 h-3" />
              Archived
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex flex-col items-center space-y-4">
            {/* Target Hours Display */}
            <div className="glass rounded-lg p-3 w-full text-center border border-muted/20">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Daily Target:</span>
                <span className="font-semibold">{task.targetHours}h</span>
              </div>
            </div>
            
            {/* Archive info */}
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground/60">
                This tracker has been archived and is no longer active.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-300 group/btn"
          >
            <Trash2 className="h-4 w-4 mr-2 group-hover/btn:animate-pulse" /> 
            Delete Permanently
          </Button>
        </CardFooter>
        
      </div>
    </Card>
  );
}
