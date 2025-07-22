'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { API_URL } from '@/lib/api';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Ship, Wind, Ruler, Weight, Link2, AlertCircle, Search, X, ChevronsUpDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Euro, Users } from 'lucide-react';

// Types based on Supabase data structure
interface Yacht {
  id: string;
  name: string;
  builder: string;
  year_built: number;
  length_m: number;
  beam_m: number;
  volume_gt: number;
  max_speed_kn: number;
  yacht_pictures: string[];
  detail_url: string;
  price?: number;
  owner?: string;
}

interface ApiResponse {
  success: boolean;
  data: Yacht[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search: string;
    minLength: string;
    maxLength: string;
    builder: string;
  };
}

const PaginationComponent = ({ pagination, onPageChange }: { pagination: ApiResponse['pagination'], onPageChange: (page: number) => void }) => {
  const { page, totalPages } = pagination;

  const getPaginationItems = () => {
    const items: (string | number)[] = [];
    // Use a smaller page range for mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const pageRange = isMobile ? 1 : 2;

    if (totalPages <= 1) return [];

    // Always add first page
    items.push(1);

    // Ellipsis after first page
    if (page > pageRange + 2) {
      items.push('...');
    }

    // Pages around current page
    for (let i = Math.max(2, page - pageRange); i <= Math.min(totalPages - 1, page + pageRange); i++) {
      items.push(i);
    }

    // Ellipsis before last page
    if (page < totalPages - pageRange - 1) {
      items.push('...');
    }

    // Always add last page
    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  };

  const paginationItems = getPaginationItems();

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
      <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={page === 1} className="hidden sm:inline-flex">
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => onPageChange(page - 1)} disabled={!pagination.hasPrev} className="h-8 w-8 sm:h-9 sm:w-9">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {paginationItems.map((item, index) => (
        item === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 py-1 sm:px-4 sm:py-2">...</span>
        ) : (
          <Button
            key={item}
            variant={page === item ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(item as number)}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            {item}
          </Button>
        )
      ))}
      <Button variant="outline" size="icon" onClick={() => onPageChange(page + 1)} disabled={!pagination.hasNext} className="h-8 w-8 sm:h-9 sm:w-9">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => onPageChange(totalPages)} disabled={page === totalPages} className="hidden sm:inline-flex">
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function YachtList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [pagination, setPagination] = useState<ApiResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [builders, setBuilders] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState<string[]>([]);

  // Get filters from URL
  const search = searchParams.get('search') || '';
  const minLength = searchParams.get('minLength') || '';
  const maxLength = searchParams.get('maxLength') || '';
  const builder = searchParams.get('builder') || '';
  const sortBy = searchParams.get('sortBy') || 'year_built.desc';
  const limit = searchParams.get('limit') || '12';
  const page = Number(searchParams.get('page')) || 1;

  const updateSearchParams = useCallback((newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const fetchYachts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/yachts?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch yachts.');
      const data = await response.json();
      if (data.success) {
        setYachts(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error('API request was not successful.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchBuilders = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/yachts/builders`);
      const data = await response.json();
      if (data.success) {
        setBuilders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch builders:', error);
    }
  }, []);

  useEffect(() => {
    fetchYachts();
  }, [searchParams, fetchYachts]);

  useEffect(() => {
    fetchBuilders();
  }, [fetchBuilders]);

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage.toString() });
  };

  const resetFilters = () => {
    router.push(pathname);
  };

  if (error) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error} <Button variant="link" onClick={fetchYachts}>Try again</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yacht Collection</h1>
          <p className="text-muted-foreground">Browse the world's most luxurious superyachts.</p>
        </div>
        <Link href="/quiz">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Take a Quiz!</Button>
        </Link>
      </header>

      <div className="mb-8 p-4 border rounded-lg bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-2">
            <label htmlFor="search" className="text-sm font-medium text-muted-foreground">Search by Name</label>
            <Input
              id="search"
              placeholder="e.g. 'Octopus'"
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateSearchParams({ search: e.currentTarget.value, page: '1' });
                }
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Builder</label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between">
                  {builder || "Select builder..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search builder..." />
                  <CommandList>
                    <CommandEmpty>No builder found.</CommandEmpty>
                    <CommandGroup>
                      {builders.map((b) => (
                        <CommandItem
                          key={b}
                          value={b}
                          onSelect={(currentValue: any) => {
                            const newBuilder = currentValue === builder ? '' : currentValue;
                            updateSearchParams({ builder: newBuilder || undefined });
                            setPopoverOpen(false);
                          }}
                        >
                          <Check className={`mr-2 h-4 w-4 ${builder === b ? 'opacity-100' : 'opacity-0'}`} />
                          {b}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Min Length (m)</label>
            <Input
              placeholder="Min Length (m)"
              type="number"
              defaultValue={minLength}
              onKeyDown={(e) => e.key === 'Enter' && updateSearchParams({ minLength: e.currentTarget.value, page: '1' })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Max Length (m)</label>
            <Input
              placeholder="Max Length (m)"
              type="number"
              defaultValue={maxLength}
              onKeyDown={(e) => e.key === 'Enter' && updateSearchParams({ maxLength: e.currentTarget.value, page: '1' })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Sort By</label>
            <Select
              value={sortBy}
              onValueChange={(value) => updateSearchParams({ sortBy: value, page: '1' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="length_m.desc">Length (High to Low)</SelectItem>
                <SelectItem value="length_m.asc">Length (Low to High)</SelectItem>
                <SelectItem value="year_built.desc">Year (Newest First)</SelectItem>
                <SelectItem value="year_built.asc">Year (Oldest First)</SelectItem>
                <SelectItem value="max_speed_kn.desc">Max Speed (Fastest First)</SelectItem>
                <SelectItem value="volume_gt.desc">Volume (Largest First)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => router.push(pathname)} variant="outline" className="w-full">
            <X className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: Number(limit) }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-48 bg-muted rounded-lg"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {yachts.map((yacht) => {
            const firstImage = (yacht.yacht_pictures && yacht.yacht_pictures.length > 0 && yacht.yacht_pictures[0]) || '/placeholder.svg';
            const imgSrc = brokenImages.includes(firstImage) ? '/placeholder.svg' : firstImage;

            return (
              <Card key={yacht.id} className="overflow-hidden flex flex-col">
                <CardHeader className="p-0 cursor-pointer" onClick={() => router.push(`/yacht/${yacht.id}`)}>
                  <div className="relative w-full h-48">
                    <Image
                      src={imgSrc}
                      alt={`Yacht ${yacht.name}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-300 hover:scale-110"
                      onError={() => {
                        if (firstImage !== '/placeholder.svg') {
                          setBrokenImages(prev => [...prev, firstImage]);
                        }
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-grow">
                  <CardTitle className="truncate">{yacht.name}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate">{yacht.builder || 'N/A'}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {yacht.length_m && <Badge variant="secondary"><Ruler className="mr-1 h-3 w-3" /> {yacht.length_m}m</Badge>}
                    {yacht.max_speed_kn && <Badge variant="secondary"><Wind className="mr-1 h-3 w-3" /> {yacht.max_speed_kn} kn</Badge>}
                    {yacht.volume_gt && <Badge variant="secondary"><Weight className="mr-1 h-3 w-3" /> {yacht.volume_gt} GT</Badge>}
                    {yacht.price && <Badge variant="outline" className="text-green-600 border-green-600"><Euro className="mr-1 h-3 w-3" /> {yacht.price.toLocaleString()}</Badge>}
                    {yacht.owner && <Badge variant="outline"><Users className="mr-1 h-3 w-3" /> {yacht.owner}</Badge>}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button asChild className="w-full flex-1" onClick={() => router.push(`/yacht/${yacht.id}`)}>
                    <a><Ship className="mr-2 h-4 w-4" /> Details</a>
                  </Button>
                  {yacht.detail_url && (
                    <a href={yacht.detail_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon">
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="mt-8">
          <PaginationComponent pagination={pagination} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}
