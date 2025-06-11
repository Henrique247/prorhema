
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Star, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RankingEntry {
  student_name: string;
  score: number;
  exam_title: string;
  completed_at: string;
  is_manual: boolean;
}

interface RealRankingProps {
  examId?: string;
  limit?: number;
}

const RealRanking = ({ examId, limit = 10 }: RealRankingProps) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [examId]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('exam_submissions')
        .select(`
          student_name,
          score,
          completed_at,
          is_manual,
          exams!inner(title)
        `)
        .order('score', { ascending: false });

      if (examId) {
        query = query.eq('exam_id', examId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = data?.map((item: any) => ({
        student_name: item.student_name,
        score: item.score,
        exam_title: item.exams.title,
        completed_at: item.completed_at,
        is_manual: item.is_manual
      })) || [];

      setRankings(formattedData);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRankBadge = (position: number) => {
    switch (position) {
      case 1:
        return <Badge className="bg-yellow-100 text-yellow-800">1º Lugar</Badge>;
      case 2:
        return <Badge className="bg-gray-100 text-gray-800">2º Lugar</Badge>;
      case 3:
        return <Badge className="bg-amber-100 text-amber-800">3º Lugar</Badge>;
      default:
        return <Badge variant="outline">{position}º</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando ranking...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          {examId ? "Ranking da Prova" : "Ranking Geral"}
        </CardTitle>
        <CardDescription>
          {examId ? 
            "Melhores pontuações desta prova" : 
            "Melhores pontuações de todas as provas"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rankings.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma submissão encontrada
            </h3>
            <p className="text-gray-500">
              Ainda não há resultados para mostrar no ranking.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((entry, index) => {
              const position = index + 1;
              return (
                <div
                  key={`${entry.student_name}-${entry.completed_at}`}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(position)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-lg font-semibold text-gray-900 truncate">
                        {entry.student_name}
                      </p>
                      {getRankBadge(position)}
                      {entry.is_manual && (
                        <Badge variant="outline" className="text-xs">
                          Manual
                        </Badge>
                      )}
                    </div>
                    
                    {!examId && (
                      <p className="text-sm text-gray-600 truncate">
                        {entry.exam_title}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {new Date(entry.completed_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {entry.score}
                    </div>
                    <div className="text-sm text-gray-500">
                      pontos
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealRanking;
