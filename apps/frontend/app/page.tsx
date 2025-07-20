import { Suspense } from 'react';
import YachtList from '@/components/YachtList';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <YachtList />
    </Suspense>
  );
}
