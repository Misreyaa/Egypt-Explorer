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
  const category = Array.isArray(rawTags)
    ? rawTags.map(String)
    : typeof rawTags === 'string'
    ? rawTags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return {
    id: d.place_id || d._id,
    name: d.name || 'Unknown destination',
    description,
    imageUrl,
    category,
    travelType: ['solo', 'group', 'family'],
    rating: 4.8,
    duration: d.average_visit_duration || 'Half day',
    groupSize: 'Any',
  };
}

export function useDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDestinations() {
      try {
        const { data } = await axios.get<ApiDestination[]>(
          'http://127.0.0.1:8080/destinations/',
          { signal: controller.signal }
        );

        setDestinations(data.map(mapApiToDestination));
      } catch (err: any) {
        console.error('Fetch failed:', err.message);
        setDestinations(allDestinations); // fallback only
        setError('Using offline data');
      } finally {
        setLoading(false);
      }
    }

    fetchDestinations();
    return () => controller.abort();
  }, []);

  return { destinations, loading, error };
}
