"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Search } from "lucide-react";
import dynamic from "next/dynamic";

const OsmMap = dynamic(() => import("./osm-map"), {
    loading: () => <div className="p-4 flex justify-center h-full items-center bg-gray-50"><Loader2 className="animate-spin text-pink-500" /></div>,
    ssr: false
});

type LocationPickerProps = {
    onLocationSelect: (address: string, lat?: number, lng?: number) => void;
    initialAddress?: string;
};

type SearchResult = {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
};

export function LocationPicker({ onLocationSelect, initialAddress = "" }: LocationPickerProps) {
    const [query, setQuery] = useState(initialAddress);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setShowResults(true);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (val.length < 3) {
            setResults([]);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`);
                const data = await response.json();
                setResults(data);
            } catch (err) {
                console.error("Nomintaim search error", err);
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    const handleSelect = (result: SearchResult) => {
        const address = result.display_name.split(",")[0]; // Simple name
        const fullAddress = result.display_name;

        setQuery(fullAddress);
        setShowResults(false);
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setSelectedCoords({ lat, lng });
        onLocationSelect(fullAddress, lat, lng);
    };

    // If we have an initial address but no coords, we might want to try to fetch them? 
    // Or just default center.
    // For now, let's default to somewhere (SP for example) or try to geocode the initialAddress on mount?
    // Let's keep it simple. If initialAddress is just text, do nothing on map until user chooses?
    // User can just type again if they want to pin it.

    return (
        <div className="space-y-4">
            <div className="relative">
                <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                        value={query}
                        onChange={handleSearch}
                        placeholder="Digite o endereço do evento..."
                        className="pl-10"
                    />
                    {loading && <div className="absolute right-3 top-2.5"><Loader2 className="w-5 h-5 animate-spin text-pink-500" /></div>}
                </div>
                {showResults && results.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white mt-1 rounded-md shadow-lg border border-gray-100 max-h-60 overflow-auto">
                        {results.map((item) => (
                            <li
                                key={item.place_id}
                                onClick={() => handleSelect(item)}
                                className="px-4 py-2 hover:bg-pink-50 cursor-pointer text-sm text-gray-700 transition-colors border-b border-gray-50 last:border-0"
                            >
                                {item.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-64 w-full bg-gray-50 relative z-0">
                {selectedCoords ? (
                    <OsmMap lat={selectedCoords.lat} lng={selectedCoords.lng} />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/50 p-4 text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                            <Search className="text-gray-400 w-8 h-8" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Digite um endereço acima para ver no mapa.</p>
                        <p className="text-gray-400 text-xs mt-1">(Usando OpenStreetMap)</p>
                    </div>
                )}
            </div>
        </div>
    );
}
