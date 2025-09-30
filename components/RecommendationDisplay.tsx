
import React, { useRef, useEffect, useState } from 'react';
import type { AnalysisResult } from '../types';
import { MUSIC_TRACKS } from '../constants';

interface RecommendationDisplayProps {
  videoUrl: string;
  analysis: AnalysisResult;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ videoUrl, analysis }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    const syncPlay = () => audio.play().catch(e => console.error("Audio play failed:", e));
    const syncPause = () => audio.pause();
    const syncSeek = () => { audio.currentTime = video.currentTime; };

    video.addEventListener('play', syncPlay);
    video.addEventListener('pause', syncPause);
    video.addEventListener('seeking', syncSeek);
    
    return () => {
      video.removeEventListener('play', syncPlay);
      video.removeEventListener('pause', syncPause);
      video.removeEventListener('seeking', syncSeek);
    };
  }, [selectedMusic]);

  const handleMusicSelect = (genre: string) => {
    const trackUrl = MUSIC_TRACKS[genre];
    if (trackUrl) {
      if (selectedMusic === trackUrl) {
        // Deselect
        setSelectedMusic(null);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      } else {
        setSelectedMusic(trackUrl);
        if (audioRef.current) {
          audioRef.current.src = trackUrl;
          audioRef.current.load();
          if (videoRef.current && !videoRef.current.paused) {
            audioRef.current.currentTime = videoRef.current.currentTime;
            audioRef.current.play().catch(e => console.error("Audio play failed on select:", e));
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col lg:flex-row gap-8">
      <div className="flex-grow lg:w-2/3 flex flex-col">
        <div className="w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-purple-900/20 aspect-video">
          <video ref={videoRef} src={videoUrl} controls className="w-full h-full object-contain" />
        </div>
        <audio ref={audioRef} />
      </div>

      <div className="lg:w-1/3 bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">AI Analysis</h2>
        <p className="text-gray-300 mb-6 italic">"{analysis.description}"</p>
        
        <h3 className="text-xl font-semibold text-white mb-4">Recommended Soundtracks</h3>
        <div className="flex flex-col gap-3">
          {analysis.recommendations.map((genre) => (
            <button
              key={genre}
              onClick={() => handleMusicSelect(genre)}
              className={`w-full text-left p-3 rounded-md transition-all duration-200 ${selectedMusic === MUSIC_TRACKS[genre] ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-700 hover:bg-purple-500 hover:text-white'}`}
            >
              <span className="font-medium">{genre}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationDisplay;
