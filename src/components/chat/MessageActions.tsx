
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw, Edit } from 'lucide-react';

interface MessageActionsProps {
  content: string;
  originalPrompt: string;
  messageId: string;
  onCopy: (content: string) => void;
  onRedo: (originalPrompt: string) => void;
  onEdit: (messageId: string, originalPrompt: string) => void;
}

const MessageActions = ({
  content,
  originalPrompt,
  messageId,
  onCopy,
  onRedo,
  onEdit
}: MessageActionsProps) => {
  return (
    <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-white/10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onCopy(content)}
        className="h-8 px-2 text-xs text-slate-400 hover:text-white hover:bg-white/5"
      >
        <Copy className="h-3 w-3 mr-1" />
        Copy
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRedo(originalPrompt)}
        className="h-8 px-2 text-xs text-slate-400 hover:text-white hover:bg-white/5"
        disabled={!originalPrompt}
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Redo
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(messageId, originalPrompt)}
        className="h-8 px-2 text-xs text-slate-400 hover:text-white hover:bg-white/5"
        disabled={!originalPrompt}
      >
        <Edit className="h-3 w-3 mr-1" />
        Edit
      </Button>
    </div>
  );
};

export default MessageActions;
