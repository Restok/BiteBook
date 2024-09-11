export interface Entry {
  id: string;
  userId: string;
  title: string;
  entryType: string;
  images: string[];
  timestamp: number;
  journals: string[];
  reactions: Record<string, string[]>;
  overallScore: number;
  nutritionAnalysis: Array<{
    name: string;
    score: "green" | "yellow" | "orange" | "red";
    servingSize: number;
    category: string;
    weight: number;
    reasoning: string;
    emoji: string;
  }>;
  points: number;
}
