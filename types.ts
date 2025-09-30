
export interface RecommendedSong {
  songName: string;
  artist: string;
}

export interface AnalysisResult {
  description: string;
  recommendations: RecommendedSong[];
}
