import {
  AddExpenseSheet,
  type AddExpenseSheetRef,
} from '@/components/features/add-expense/AddExpenseSheet';
import { createContext, useContext, useRef, type ReactNode } from 'react';

type AddSheetCtx = {
  openExpense: () => void;
  openRevenue: () => void;
};

const AddSheetContext = createContext<AddSheetCtx | null>(null);

export function AddSheetProvider({ children }: { children: ReactNode }) {
  const ref = useRef<AddExpenseSheetRef>(null);

  return (
    <AddSheetContext.Provider
      value={{
        openExpense: () => ref.current?.open('EXPENSE'),
        openRevenue: () => ref.current?.open('REVENUE'),
      }}
    >
      {children}
      <AddExpenseSheet ref={ref} />
    </AddSheetContext.Provider>
  );
}

export function useAddSheet() {
  const ctx = useContext(AddSheetContext);
  if (!ctx) throw new Error('useAddSheet must be used within AddSheetProvider');
  return ctx;
}
