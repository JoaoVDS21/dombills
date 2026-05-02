import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

type DotTypes = Set<'expense' | 'revenue'>;

type MonthCalendarProps = {
  year: number;
  month: number; // 0-11
  mode?: 'single' | 'range';
  selectedDay?: number | null;
  rangeStart?: number | null;
  rangeEnd?: number | null;
  dotsByDate?: Record<string, DotTypes>; // 'YYYY-MM-DD' -> types
  onDayPress?: (timestamp: number) => void;
  onMonthChange?: (year: number, month: number) => void;
};

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function startOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function MonthCalendar({
  year,
  month,
  mode = 'single',
  selectedDay,
  rangeStart,
  rangeEnd,
  dotsByDate = {},
  onDayPress,
  onMonthChange,
}: MonthCalendarProps) {
  const days = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const todayKey = toDateKey(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  function handlePrev() {
    if (!onMonthChange) return;
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  }

  function handleNext() {
    if (!onMonthChange) return;
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  }

  function isDaySelected(day: number): boolean {
    if (mode === 'single') {
      if (!selectedDay) return false;
      return startOfDay(selectedDay) === startOfDay(new Date(year, month, day).getTime());
    }
    // range mode
    const ts = new Date(year, month, day).getTime();
    if (rangeStart && startOfDay(rangeStart) === startOfDay(ts)) return true;
    if (rangeEnd && startOfDay(rangeEnd) === startOfDay(ts)) return true;
    return false;
  }

  function isDayInRange(day: number): boolean {
    if (mode !== 'range' || !rangeStart || !rangeEnd) return false;
    const ts = new Date(year, month, day).getTime();
    return ts > startOfDay(rangeStart) && ts < startOfDay(rangeEnd);
  }

  function isRangeEdge(day: number): 'start' | 'end' | null {
    if (mode !== 'range') return null;
    const ts = new Date(year, month, day).getTime();
    if (rangeStart && startOfDay(rangeStart) === startOfDay(ts)) return 'start';
    if (rangeEnd && startOfDay(rangeEnd) === startOfDay(ts)) return 'end';
    return null;
  }

  return (
    <View className="px-4">
      {/* Month navigator */}
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={handlePrev}
          className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
        >
          <ChevronLeft size={20} color="#94a3b8" />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </Text>
        <Pressable
          onPress={handleNext}
          className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
        >
          <ChevronRight size={20} color="#94a3b8" />
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View className="mb-2 flex-row">
        {WEEK_DAYS.map((d, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs font-medium text-muted-foreground">{d}</Text>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View className="flex-row flex-wrap">
        {days.map((day, idx) => {
          if (!day) {
            return <View key={`empty-${idx}`} className="aspect-square flex-[1/7]" style={{ width: '14.28%' }} />;
          }

          const key = toDateKey(year, month, day);
          const isToday = key === todayKey;
          const selected = isDaySelected(day);
          const inRange = isDayInRange(day);
          const edge = isRangeEdge(day);
          const dots = dotsByDate[key];

          return (
            <Pressable
              key={key}
              onPress={() => {
                const ts = new Date(year, month, day).getTime();
                onDayPress?.(ts);
              }}
              style={{ width: '14.28%' }}
              className="items-center py-1 active:opacity-70"
            >
              {/* Range background strip */}
              {inRange && (
                <View className="absolute inset-y-1 left-0 right-0 bg-primary/20" />
              )}
              {edge === 'start' && (
                <View className="absolute inset-y-1 right-0" style={{ left: '50%', backgroundColor: 'rgba(59,130,246,0.2)' }} />
              )}
              {edge === 'end' && (
                <View className="absolute inset-y-1 left-0" style={{ right: '50%', backgroundColor: 'rgba(59,130,246,0.2)' }} />
              )}

              {/* Day circle */}
              <View
                className={cn(
                  'h-8 w-8 items-center justify-center rounded-full',
                  selected && 'bg-primary',
                  isToday && !selected && 'border border-primary',
                )}
              >
                <Text
                  className={cn(
                    'text-sm',
                    selected ? 'font-bold text-primary-foreground' : 'text-foreground',
                    isToday && !selected && 'font-semibold text-primary',
                  )}
                >
                  {day}
                </Text>
              </View>

              {/* Transaction dots */}
              {dots && dots.size > 0 && (
                <View className="mt-0.5 flex-row gap-0.5">
                  {dots.has('expense') && (
                    <View className="h-1 w-1 rounded-full bg-red-500" />
                  )}
                  {dots.has('revenue') && (
                    <View className="h-1 w-1 rounded-full bg-green-500" />
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
