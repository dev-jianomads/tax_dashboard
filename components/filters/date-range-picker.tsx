'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, RotateCcw } from 'lucide-react';

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (date: string) => void;
  onToChange: (date: string) => void;
  onReset: () => void;
}

export function DateRangePicker({ 
  from, 
  to, 
  onFromChange, 
  onToChange, 
  onReset 
}: DateRangePickerProps) {
  return (
    <div className="flex items-end space-x-4">
      <div className="space-y-2">
        <Label htmlFor="from-date" className="text-sm font-medium text-gray-700">
          From
        </Label>
        <div className="relative">
          <Input
            id="from-date"
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-40"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="to-date" className="text-sm font-medium text-gray-700">
          To
        </Label>
        <div className="relative">
          <Input
            id="to-date"
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="w-40"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="flex items-center space-x-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reset</span>
      </Button>
    </div>
  );
}