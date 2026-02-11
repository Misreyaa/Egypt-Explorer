import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Destination } from '../components/TravelCard';
import { allDestinations } from '../data/destinations';

type ApiDestination = {
  _id: string;
  place_id?: string;
  name?: string;
  short_description?: string;
  historical_context?: string;
  image_path?: string;
  tags?: string[] | string | null;
  // Some older documents might still have a single "category" field
  category?: string[] | string | null;
  average_visit_duration?: string;
};

function mapApiToDestination(d: ApiDestination): Destination {
  const description =
    d.short_description ||
    d.historical_context ||
    'Explore this unique Egyptian destination.';

  const imageUrl = d.image_path
    ? d.image_path.startsWith('http')
      ? d.image_path
      : `/images/${d.image_path}`
    : 'https://images.unsplash.com/photo-1580745372256-9cbe3ebb4f8d?q=80&w=1200&auto=format&fit=crop';

  const rawTags = d.tags ?? d.category ?? [];
  const tagsArray: string[] = Array.isArray(rawTags)
    ? rawTags.map(String)
    : rawTags
    ? String(rawTags)
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
    : [];

  return {
    id: d.place_id || d._id,
    name: d.name || 'Unknown destination',
    description,
    imageUrl,
    category: tagsArray,
    // Until you add structured travel type info in the DB, keep these generic
    travelType: ['solo', 'group', 'family'],
    rating: 4.8,
    duration: d.average_visit_duration || 'Half day',
    groupSize: 'Any',
  };
}

export function useDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>(allDestinations);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDestinations = async () => {
      try {
        const response = await axios.get<ApiDestination[]>('http://127.0.0.1:8080/destinations/', {
          headers: { accept: 'application/json' },
        });

        if (cancelled) return;

        const mapped = response.data.map(mapApiToDestination);
        setDestinations(mapped);
        setError(null);
      } catch (err: any) {
        if (cancelled) return;
        console.error('Failed to fetch destinations from API:', err.response?.data || err.message);
        // Keep static allDestinations as a fallback
        setError(err.message ?? 'Failed to load destinations');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDestinations();

    return () => {
      cancelled = true;
    };
  }, []);

  return { destinations, loading, error };
}

