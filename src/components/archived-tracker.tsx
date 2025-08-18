"use client";

// Anime-styled Archived Tracker Component

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    onDelete(task.id);
    setIsDeleteDialogOpen(false);
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
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-300 group/btn"
              >
                <Trash2 className="h-4 w-4 mr-2 group-hover/btn:animate-pulse" /> 
                Delete Permanently
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl max-w-md mx-auto">
              <DialogHeader className="bg-gradient-to-r from-destructive/20 to-destructive/10 -m-6 mb-6 p-6 rounded-t-lg border-b border-border/30">
                <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="glass rounded-lg p-2 bg-destructive/20">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  Delete Tracker
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-2">
                  This action cannot be undone. This will permanently delete the tracker and all its data.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="glass rounded-lg p-4 bg-muted/10 border border-border/20">
                  <h4 className="font-medium text-foreground mb-1">{task.trackerName}</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
              </div>
              
              <DialogFooter className="gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="glass border-border/30 hover:bg-muted/20"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 shadow-lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
        
      </div>
    </Card>
  );
}
