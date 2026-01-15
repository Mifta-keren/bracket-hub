import { Trophy, Download, Heart, Users } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-2 text-sm backdrop-blur">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">100+ Printable Tournament Brackets</span>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Create & Print{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Tournament Brackets
            </span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Download free printable brackets for sports, gaming, movies, music, and more. 
            Perfect for tournaments, competitions, and fun challenges with friends.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Stat icon={Download} value="10K+" label="Downloads" />
            <Stat icon={Heart} value="5K+" label="Loves" />
            <Stat icon={Users} value="8+" label="Categories" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ 
  icon: Icon, 
  value, 
  label 
}: { 
  icon: React.ElementType; 
  value: string; 
  label: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div className="text-left">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  </div>
);

export default HeroSection;
