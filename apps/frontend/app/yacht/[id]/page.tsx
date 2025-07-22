'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { API_URL } from '@/lib/api';
import { Loader2, AlertCircle, ArrowLeft, Ship, Ruler, Zap, Paintbrush, ExternalLink, Info, Euro, Users, Anchor, Home } from 'lucide-react';
import ImageCarousel from '@/components/ImageCarousel';

// Types
interface Yacht {
  id: string;
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
  yacht_pictures: string[];
  interior_pictures: string[];
  detail_url: string;
  price: number;
  annual_running_cost: number;
  owner: string;
  former_owner: string;
}

interface YachtDetailProps {
  params: { id: string };
}

const StatItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-semibold text-right">{value}</p>
  </div>
);

export default function YachtDetail({ params }: YachtDetailProps) {
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchYacht = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/yachts/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setYacht(null);
          return;
        }
        throw new Error('Failed to fetch yacht data.');
      }
      const data = await response.json();
      if (data.success && data.data) {
        setYacht(data.data);
      } else {
        setYacht(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

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

  const hasBuildData = yacht.builder || yacht.year_built;
  const hasDimensionsData = yacht.length_m || yacht.beam_m || yacht.volume_gt;
  const hasPerformanceData = yacht.cruising_speed_kn || yacht.max_speed_kn;
  const hasDesignData = yacht.naval_architect || yacht.exterior_designer || yacht.interior_designer;
  const hasFinancialsData = yacht.price || yacht.annual_running_cost;
  const hasOwnershipData = yacht.owner || yacht.former_owner;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="outline" size="icon"><ArrowLeft /></Button>
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
          <ImageCarousel images={yacht.yacht_pictures} title={`Exterior of ${yacht.name}`} />
        </div>

        <div className="space-y-8">
          {hasBuildData && (
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Ship className="mr-2" />Build Info</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <StatItem label="Builder" value={yacht.builder || '-'} />
                <Separator />
                <StatItem label="Year Built" value={yacht.year_built || '-'} />
              </CardContent>
            </Card>
          )}

          {hasDimensionsData && (
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Ruler className="mr-2" />Dimensions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <StatItem label="Length" value={yacht.length_m ? `${yacht.length_m}m` : '-'} />
                <Separator />
                <StatItem label="Beam" value={yacht.beam_m ? `${yacht.beam_m}m` : '-'} />
                <Separator />
                <StatItem label="Volume" value={yacht.volume_gt ? `${yacht.volume_gt} GT` : '-'} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
          {hasPerformanceData && (
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Zap className="mr-2" />Performance</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <StatItem label="Cruising Speed" value={yacht.cruising_speed_kn ? `${yacht.cruising_speed_kn} kn` : '-'} />
                <Separator />
                <StatItem label="Max Speed" value={yacht.max_speed_kn ? <span className="text-primary font-bold">{yacht.max_speed_kn} kn</span> : '-'} />
              </CardContent>
            </Card>
          )}

          {hasDesignData && (
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Paintbrush className="mr-2" />Design</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {yacht.naval_architect && <StatItem label="Naval Architect" value={yacht.naval_architect} />}
                {yacht.exterior_designer && <><Separator /><StatItem label="Exterior Designer" value={yacht.exterior_designer} /></>}
                {yacht.interior_designer && <><Separator /><StatItem label="Interior Designer" value={yacht.interior_designer} /></>}
              </CardContent>
            </Card>
          )}

          {hasFinancialsData && (
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Euro className="mr-2" />Financials</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {yacht.price && <StatItem label="Price" value={`${yacht.price.toLocaleString()}`} />}
                {yacht.annual_running_cost && <><Separator /><StatItem label="Annual Running Cost" value={`≈ ${yacht.annual_running_cost.toLocaleString()}`} /></>}
              </CardContent>
            </Card>
          )}

          {hasOwnershipData && (
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="mr-2" />Ownership</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {yacht.owner && <StatItem label="Owner" value={yacht.owner} />}
                {yacht.former_owner && <><Separator /><StatItem label="Former Owner" value={yacht.former_owner} /></>}
              </CardContent>
            </Card>
          )}
        </div>

        {yacht.interior_pictures && yacht.interior_pictures.length > 0 && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Home className="mr-2" />Interior</CardTitle></CardHeader>
              <CardContent>
                <ImageCarousel images={yacht.interior_pictures} title={`Interior of ${yacht.name}`} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
