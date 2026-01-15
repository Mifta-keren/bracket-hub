import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Bracket {
  id: string;
  title: string;
  description: string | null;
  category: string;
  participants: number;
  image_url: string | null;
  pdf_url: string | null;
  loves_count: number;
  downloads_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  bracket_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
}

export const useBrackets = (category?: string) => {
  return useQuery({
    queryKey: ['brackets', category],
    queryFn: async () => {
      let query = supabase
        .from('brackets')
        .select('*')
        .order('loves_count', { ascending: false });
      
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Bracket[];
    }
  });
};

export const useBracket = (id: string) => {
  return useQuery({
    queryKey: ['bracket', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brackets')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Bracket | null;
    },
    enabled: !!id
  });
};

export const useComments = (bracketId: string) => {
  return useQuery({
    queryKey: ['comments', bracketId],
    queryFn: async () => {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('bracket_id', bracketId)
        .order('created_at', { ascending: false });
      
      if (commentsError) throw commentsError;
      
      // Fetch profiles separately
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', userIds);
      
      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, { username: p.username, avatar_url: p.avatar_url }]) || []
      );
      
      return commentsData.map(comment => ({
        ...comment,
        profiles: profilesMap.get(comment.user_id) || { username: null, avatar_url: null }
      })) as Comment[];
    },
    enabled: !!bracketId
  });
};

export const useUserLoves = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-loves', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bracket_loves')
        .select('bracket_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(l => l.bracket_id);
    },
    enabled: !!user
  });
};

export const useToggleLove = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ bracketId, isLoved }: { bracketId: string; isLoved: boolean }) => {
      if (!user) throw new Error('Must be logged in');
      
      if (isLoved) {
        const { error } = await supabase
          .from('bracket_loves')
          .delete()
          .eq('user_id', user.id)
          .eq('bracket_id', bracketId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bracket_loves')
          .insert({ user_id: user.id, bracket_id: bracketId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brackets'] });
      queryClient.invalidateQueries({ queryKey: ['bracket'] });
      queryClient.invalidateQueries({ queryKey: ['user-loves'] });
    }
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ bracketId, content }: { bracketId: string; content: string }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('comments')
        .insert({ user_id: user.id, bracket_id: bracketId, content });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.bracketId] });
      toast({ title: 'Comment added!' });
    },
    onError: () => {
      toast({ title: 'Failed to add comment', variant: 'destructive' });
    }
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, bracketId }: { commentId: string; bracketId: string }) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      return bracketId;
    },
    onSuccess: (bracketId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', bracketId] });
      toast({ title: 'Comment deleted' });
    }
  });
};
