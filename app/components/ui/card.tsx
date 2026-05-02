import { cn } from '@/lib/utils';
import { View, type ViewProps } from 'react-native';
import { Text } from './text';

function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('rounded-2xl border border-border bg-card', className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn('flex-col gap-1.5 p-5', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text variant="h4" className={cn('leading-none', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text variant="muted" className={cn('text-sm', className)} {...props} />;
}

function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn('px-5 pb-5', className)} {...props} />;
}

function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View className={cn('flex-row items-center px-5 pb-5', className)} {...props} />
  );
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
