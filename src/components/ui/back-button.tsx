import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Back' }) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Button>
  );
};

export default BackButton; 