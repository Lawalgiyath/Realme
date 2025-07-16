import { Phone, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const resources = [
  {
    name: 'National Suicide Prevention Lifeline',
    description: 'Provides 24/7, free and confidential support for people in distress, prevention and crisis resources for you or your loved ones.',
    phone: '988',
    website: '988lifeline.org',
  },
  {
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741 from anywhere in the US, anytime, about any type of crisis. A live, trained Crisis Counselor receives the text and responds.',
    phone: 'Text HOME to 741741',
    website: 'crisistextline.org',
  },
  {
    name: 'The Trevor Project',
    description: 'The leading national organization providing crisis intervention and suicide prevention services to lesbian, gay, bisexual, transgender, queer & questioning (LGBTQ) young people under 25.',
    phone: '1-866-488-7386',
    website: 'thetrevorproject.org',
  },
  {
    name: 'NAMI (National Alliance on Mental Illness)',
    description: 'The nation’s largest grassroots mental health organization dedicated to building better lives for the millions of Americans affected by mental illness.',
    phone: '1-800-950-NAMI (6264)',
    website: 'nami.org',
  },
];

export default function ResourceDirectory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Directory</CardTitle>
        <CardDescription>Find contact information for various mental health support services.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {resources.map((resource) => (
          <Card key={resource.name} className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-lg">{resource.name}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
               <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href={`tel:${resource.phone}`} className="hover:underline">{resource.phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <a href={`https://${resource.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{resource.website}</a>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
