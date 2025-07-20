'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { API_URL } from '@/lib/api';
import { Loader2, AlertCircle, ArrowLeft, Ship, Ruler, Zap, Paintbrush, ExternalLink, Info } from 'lucide-react';

// Types
interface Yacht {
  name: string;
  builder: string;
  flag: string;
  year_built: number;
  length_m: number;
  beam_m: number;
  volume_gt: number;
  cruising_speed_kn: number;
  max_speed_kn: number;
  naval_architect: string;
  exterior_designer: string;
  interior_designer: string;
  yacht_picture: string;
  detail_url: string;
}

interface YachtDetailProps {
  params: { name: string };
}

const StatItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-semibold text-right">{value}</p>
  </div>
);

export default function YachtDetail({ params }: YachtDetailProps) {
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchYacht = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const decodedName = decodeURIComponent(params.name);
            const response = await fetch(`${API_URL}/api/yachts?search=${encodeURIComponent(decodedName)}&limit=1`);
      if (!response.ok) throw new Error('Failed to fetch yacht data.');
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const exactMatch = data.data.find((y: Yacht) => y.name.toLowerCase() === decodedName.toLowerCase());
        setYacht(exactMatch || data.data[0]);
      } else {
        setYacht(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [params.name]);

  useEffect(() => {
    fetchYacht();
  }, [fetchYacht]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Yacht Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Yacht</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4 flex gap-4">
              <Button onClick={fetchYacht} variant="secondary"><ArrowLeft className="mr-2 h-4 w-4" />Try Again</Button>
              <Link href="/"><Button><ArrowLeft className="mr-2 h-4 w-4" />Back to List</Button></Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!yacht) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon"><ArrowLeft /></Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{yacht.name}</h1>
          {yacht.flag && <Badge variant="secondary">{yacht.flag}</Badge>}
        </div>
        {yacht.detail_url && (
          <a href={yacht.detail_url} target="_blank" rel="noopener noreferrer">
            <Button>More Info <ExternalLink className="ml-2 h-4 w-4" /></Button>
          </a>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-2">
              <div className="relative aspect-video w-full overflow-hidden rounded-md">
                <Image
                  src={yacht.yacht_picture}
                  alt={`Photo of ${yacht.name}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Ship className="mr-2" />Build Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <StatItem label="Builder" value={yacht.builder} />
              <Separator />
              <StatItem label="Year Built" value={yacht.year_built} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><Ruler className="mr-2" />Dimensions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <StatItem label="Length" value={`${yacht.length_m}m`} />
              <Separator />
              <StatItem label="Beam" value={`${yacht.beam_m}m`} />
              <Separator />
              <StatItem label="Volume" value={`${yacht.volume_gt} GT`} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Zap className="mr-2" />Performance</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <StatItem label="Cruising Speed" value={`${yacht.cruising_speed_kn} kn`} />
              <Separator />
              <StatItem label="Max Speed" value={<span className="text-primary font-bold">{yacht.max_speed_kn} kn</span>} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><Paintbrush className="mr-2" />Design</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {yacht.naval_architect && <StatItem label="Naval Architect" value={yacht.naval_architect} />}
              {yacht.exterior_designer && <><Separator /><StatItem label="Exterior Designer" value={yacht.exterior_designer} /></>}
              {yacht.interior_designer && <><Separator /><StatItem label="Interior Designer" value={yacht.interior_designer} /></>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
