
import React, { useRef } from 'react';
import type { AnalysisResult } from '../types';
import { YouTubeIcon } from './icons';

interface RecommendationDisplayProps {
  videoUrl: string;
  analysis: AnalysisResult;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ videoUrl, analysis }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const createYouTubeSearchLink = (songName: string, artist: string) => {
    const query = encodeURIComponent(`${songName} ${artist}`);
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col lg:flex-row gap-8">
      <div className="flex-grow lg:w-2/3 flex flex-col">
        <div className="w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-purple-900/20 aspect-video">
          <video ref={videoRef} src={videoUrl} controls className="w-full h-full object-contain" />
        </div>
      </div>

      <div className="lg:w-1/3 bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2 sticky top-0 bg-gray-800">AI Analysis</h2>
        <p className="text-gray-300 mb-6 italic">"{analysis.description}"</p>
        
        <h3 className="text-xl font-semibold text-white mb-4 sticky top-[70px] bg-gray-800">Trending Soundtrack Recommendations</h3>
        <div className="flex flex-col gap-4">
          {analysis.recommendations.map((song, index) => (
            <div
              key={index}
              className="bg-gray-700 p-4 rounded-lg flex justify-between items-center transition-transform duration-200 hover:scale-105"
            >
              <div>
                <p className="font-bold text-white text-lg">{song.songName}</p>
                <p className="text-gray-400 text-sm">{song.artist}</p>
              </div>
              <a
                href={createYouTubeSearchLink(song.songName, song.artist)}
                target="_blank"
                rel="noopener noreferrer"
                title="Search on YouTube"
                aria-label={`Search for ${song.songName} by ${song.artist} on YouTube`}
                className="bg-gray-600 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200"
              >
                <YouTubeIcon className="w-6 h-6" />
              </a>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-6">
          <p className="text-xs text-gray-500 text-center">
            These are AI-powered recommendations. You are responsible for ensuring proper licensing and copyright compliance if you choose to use any of these songs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDisplay;
