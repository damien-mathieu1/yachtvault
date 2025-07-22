'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Yacht Not Found</AlertTitle>
        <AlertDescription>
          The yacht you are looking for does not exist or is no longer available.
          <div className="mt-4">
            <Link href="/">
              <Button variant="secondary">
                <Home className="mr-2 h-4 w-4" />
                Back to Collection
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
