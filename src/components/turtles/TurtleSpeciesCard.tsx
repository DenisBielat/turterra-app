import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface TurtleSpecies {
  name: string;
  scientificName: string;
  conservation: string;
  habitat: string;
  description: string;
  imageUrl: string;
}

const mockTurtleData: TurtleSpecies = {
  name: "Loggerhead Sea Turtle",
  scientificName: "Caretta caretta",
  conservation: "Vulnerable",
  habitat: "Ocean",
  description: "The loggerhead sea turtle is the world's largest hard-shelled turtle, famous for its large head and powerful jaws.",
  imageUrl: "/api/placeholder/400/300"
};

export default function TurtleSpeciesCard() {
  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={mockTurtleData.imageUrl}
          alt={mockTurtleData.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <Badge 
          className="absolute top-2 right-2 bg-red-500"
          variant="secondary"
        >
          {mockTurtleData.conservation}
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{mockTurtleData.name}</span>
          <span className="text-sm text-gray-500 italic">
            {mockTurtleData.scientificName}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-start gap-2 text-gray-600">
          <Info className="w-4 h-4 mt-1 flex-shrink-0" />
          <p className="text-sm">{mockTurtleData.description}</p>
        </div>
        
        <div className="mt-4">
          <Badge variant="outline">
            {mockTurtleData.habitat}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}