'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { FlightSearch } from '@/components/FlightSearch';
import { FlightResults } from '@/components/FlightResults';
import { Card, CardContent } from '@/components/ui/card';
import { Plane, Shield, Clock, Star } from 'lucide-react';
import type { Flight, FlightSearchDto } from '@/types';

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchResults = (results: Flight[]) => {
    setSearchResults(results);
  };

  const handleSearchLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Fly with Confidence
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Book your perfect flight with BTAir - where comfort meets reliability. 
              Experience premium service at competitive prices.
            </p>
            
            
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="text-lg font-semibold mb-2">Secure Booking</h3>
                <p className="text-blue-100">Your data is protected with industry-leading security</p>
              </div>
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="text-lg font-semibold mb-2">On-Time Performance</h3>
                <p className="text-blue-100">95% on-time performance across all routes</p>
              </div>
              <div className="text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="text-lg font-semibold mb-2">Premium Service</h3>
                <p className="text-blue-100">Award-winning customer service and comfort</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-6xl mx-auto shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Find Your Perfect Flight
                </h2>
                <p className="text-gray-600">
                  Search and compare flights to get the best deals for your journey
                </p>
              </div>
              
              <FlightSearch 
                onResults={handleSearchResults}
                onLoading={handleSearchLoading}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      
      {(searchResults.length > 0 || isLoading) && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <FlightResults 
              flights={searchResults}
              isLoading={isLoading}
            />
          </div>
        </section>
      )}

      
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">BTAir</span>
              </div>
              <p className="text-gray-400">
                Your trusted airline partner for comfortable and reliable air travel.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Book a Flight</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Check-in</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Flight Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Manage Booking</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Customer Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About BTAir</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BTAir. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
