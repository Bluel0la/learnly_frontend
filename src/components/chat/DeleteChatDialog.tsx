
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  chatTitle: string;
}

const DeleteChatDialog = ({ open, onOpenChange, onConfirm, chatTitle }: DeleteChatDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="luminous-glass-card border-white/10 text-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-white">Delete Chat Session</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Are you sure you want to delete "{chatTitle}"? This action cannot be undone and all messages in this conversation will be permanently lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-rose-600 text-white hover:bg-rose-500">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteChatDialog;
