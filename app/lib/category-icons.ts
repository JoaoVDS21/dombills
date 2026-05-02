import {
  BookOpen,
  Briefcase,
  Car,
  Coffee,
  DollarSign,
  Dumbbell,
  Gift,
  Heart,
  Home,
  Laptop,
  Music,
  PawPrint,
  Pill,
  Plane,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

export type CategoryIconOption = {
  name: string;
  icon: LucideIcon;
  label: string;
};

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { name: 'utensils', icon: Utensils, label: 'Alimentação' },
  { name: 'coffee', icon: Coffee, label: 'Café' },
  { name: 'shopping-bag', icon: ShoppingBag, label: 'Compras' },
  { name: 'car', icon: Car, label: 'Transporte' },
  { name: 'home', icon: Home, label: 'Casa' },
  { name: 'heart', icon: Heart, label: 'Saúde' },
  { name: 'briefcase', icon: Briefcase, label: 'Trabalho' },
  { name: 'book-open', icon: BookOpen, label: 'Educação' },
  { name: 'music', icon: Music, label: 'Lazer' },
  { name: 'wifi', icon: Wifi, label: 'Internet' },
  { name: 'plane', icon: Plane, label: 'Viagem' },
  { name: 'dumbbell', icon: Dumbbell, label: 'Academia' },
  { name: 'gift', icon: Gift, label: 'Presentes' },
  { name: 'laptop', icon: Laptop, label: 'Tecnologia' },
  { name: 'paw-print', icon: PawPrint, label: 'Pets' },
  { name: 'zap', icon: Zap, label: 'Energia' },
  { name: 'pill', icon: Pill, label: 'Farmácia' },
  { name: 'trending-up', icon: TrendingUp, label: 'Investimentos' },
  { name: 'dollar-sign', icon: DollarSign, label: 'Outros' },
];

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICON_OPTIONS.map((o) => [o.name, o.icon]),
);

export const CATEGORY_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#a855f7',
  '#84cc16',
  '#64748b',
];
