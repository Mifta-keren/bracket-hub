-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brackets table
CREATE TABLE public.brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  participants INTEGER NOT NULL DEFAULT 8,
  image_url TEXT,
  pdf_url TEXT,
  loves_count INTEGER NOT NULL DEFAULT 0,
  downloads_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bracket_loves table
CREATE TABLE public.bracket_loves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bracket_id UUID REFERENCES public.brackets(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, bracket_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bracket_id UUID REFERENCES public.brackets(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bracket_loves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Brackets policies (public read, admin write via service role)
CREATE POLICY "Brackets are viewable by everyone" ON public.brackets FOR SELECT USING (true);

-- Bracket loves policies
CREATE POLICY "Loves are viewable by everyone" ON public.bracket_loves FOR SELECT USING (true);
CREATE POLICY "Authenticated users can love" ON public.bracket_loves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own love" ON public.bracket_loves FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update loves_count
CREATE OR REPLACE FUNCTION public.update_bracket_loves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.brackets SET loves_count = loves_count + 1 WHERE id = NEW.bracket_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.brackets SET loves_count = loves_count - 1 WHERE id = OLD.bracket_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for loves count
CREATE TRIGGER on_bracket_love_changed
  AFTER INSERT OR DELETE ON public.bracket_loves
  FOR EACH ROW EXECUTE FUNCTION public.update_bracket_loves_count();

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brackets_updated_at BEFORE UPDATE ON public.brackets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample brackets
INSERT INTO public.brackets (title, description, category, participants, image_url) VALUES
('March Madness 2024', 'NCAA Basketball Tournament Bracket', 'Sports', 64, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'),
('World Cup Bracket', 'FIFA World Cup Tournament', 'Sports', 32, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400'),
('Movie Showdown', 'Best Movies of All Time', 'Entertainment', 16, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400'),
('Gaming Tournament', 'Esports Championship Bracket', 'Gaming', 8, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'),
('Music Battle', 'Greatest Artists Tournament', 'Music', 32, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'),
('Food Fight', 'Best Cuisine Bracket', 'Food', 16, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'),
('Anime Showdown', 'Best Anime Series Tournament', 'Anime', 32, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'),
('Tech Battle', 'Best Tech Products 2024', 'Technology', 16, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400');