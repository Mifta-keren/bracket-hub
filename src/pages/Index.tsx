import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategoryFilter from '@/components/CategoryFilter';
import BracketCard from '@/components/BracketCard';
import { useBrackets } from '@/hooks/useBrackets';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: brackets, isLoading } = useBrackets(selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        
        <section className="container py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Browse Brackets</h2>
            <CategoryFilter 
              selected={selectedCategory} 
              onSelect={setSelectedCategory} 
            />
          </div>
          
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : brackets && brackets.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {brackets.map((bracket) => (
                <BracketCard key={bracket.id} bracket={bracket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No brackets found in this category.</p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
