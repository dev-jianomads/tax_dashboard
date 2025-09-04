'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from './date-range-picker';
import { getDefaultDateRange } from '@/lib/utils';
import { Search } from 'lucide-react';

interface FilterBarProps {
  emails: string[];
  onFiltersChange: (filters: { email: string; from: string; to: string }) => void;
  initialFilters: { email: string; from: string; to: string };
  showUserSelect?: boolean;
}

export function FilterBar({ 
  emails, 
  onFiltersChange, 
  initialFilters, 
  showUserSelect = true 
}: FilterBarProps) {
  const defaultRange = getDefaultDateRange();

  const [email, setEmail] = useState(initialFilters.email);
  const [from, setFrom] = useState(initialFilters.from);
  const [to, setTo] = useState(initialFilters.to);

  const applyFilters = () => {
    onFiltersChange({ email: email === 'all' ? '' : email, from, to });
  };

  const resetFilters = () => {
    setEmail('all');
    setFrom(defaultRange.from);
    setTo(defaultRange.to);
    onFiltersChange({ email: '', from: defaultRange.from, to: defaultRange.to });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-wrap items-end gap-6">
        {showUserSelect && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">User Email</label>
            <Select value={email} onValueChange={setEmail}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {emails.map((emailOption) => (
                  <SelectItem key={emailOption} value={emailOption}>
                    {emailOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DateRangePicker
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onReset={() => {
            setFrom(defaultRange.from);
            setTo(defaultRange.to);
          }}
        />

        <div className="flex space-x-3">
          <Button onClick={applyFilters} className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Apply</span>
          </Button>
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}