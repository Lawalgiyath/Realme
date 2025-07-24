
"use client";

import { Phone, Globe, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { useEffect } from 'react';

const resources = [
  {
    name: 'Mentally Aware Nigeria Initiative (MANI)',
    description: 'A non-profit organization focused on raising awareness about mental health and combating stigma in Nigeria.',
    phone: '+2348060121120',
    website: 'mentallyaware.org',
  },
  {
    name: 'She Writes Woman',
    description: 'A women-led movement giving mental health a voice in Nigeria, offering a 24/7 helpline.',
    phone: '08008002000',
    website: 'shewriteswoman.org',
  },
  {
    name: 'Ndidi Health',
    description: 'Provides accessible and affordable mental healthcare services, including teletherapy with licensed professionals.',
    phone: 'Contact via website',
    website: 'www.ndidi.me',
  },
  {
    name: 'Nigeria Suicide Prevention Initiative',
    description: 'Provides suicide prevention services and counseling for individuals in crisis.',
    phone: '+2348062106493',
    website: 'nigeriasuicideprevention.com',
  },
  {
    name: 'Holiwells International',
    description: 'A mental health organization providing support and resources.',
    phone: 'Contact via website',
    website: 'holiwellsinternational.com',
  }
];

export default function ResourceDirectory() {
  const { addAchievement } = useApp();

  useEffect(() => {
    addAchievement('firstResource');
  }, [addAchievement]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nigerian Mental Health Resources</CardTitle>
        <CardDescription>Find contact information for mental health support services in Nigeria.</CardDescription>
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

    