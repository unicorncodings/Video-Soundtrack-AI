
import React, { useState, useCallback } from 'react';
import VideoUpload from './components/VideoUpload';
import Loader from './components/Loader';
import RecommendationDisplay from './components/RecommendationDisplay';
import { getMusicRecommendationsForVideo } from './services/geminiService';
import type { AnalysisResult } from './types';
import { MAX_FRAMES, FRAME_CAPTURE_DEBOUNCE } from './constants';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setIsLoading(false);
    setAnalysisResult(null);
    setError(null);
    setLoadingMessage('');
  };

  const extractFrames = useCallback(async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      setLoadingMessage('Preparing video for analysis...');
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.src = URL.createObjectURL(file);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames: string[] = [];

      if (!ctx) {
        return reject(new Error('Could not create canvas context.'));
      }

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const duration = video.duration;
        const interval = duration / (MAX_FRAMES + 1);
        let capturedFrames = 0;

        const captureFrame = (time: number) => {
          return new Promise<void>((resolveCapture) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              // Small delay to ensure frame is rendered
              setTimeout(() => {
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                frames.push(dataUrl);
                capturedFrames++;
                setLoadingMessage(`Extracting frames... (${capturedFrames}/${MAX_FRAMES})`);
                resolveCapture();
              }, FRAME_CAPTURE_DEBOUNCE);
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = time;
          });
        };

        const captureAllFrames = async () => {
          for (let i = 1; i <= MAX_FRAMES; i++) {
            await captureFrame(i * interval);
          }
          video.pause();
          URL.revokeObjectURL(video.src);
          resolve(frames);
        };

        captureAllFrames().catch(reject);
      };

      video.onerror = (e) => {
        reject(new Error('Failed to load video file.'));
      };

      video.play().catch(e => {
        // Play is needed to enable seeking in some browsers
      });
    });
  }, []);


  const analyzeVideo = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const frames = await extractFrames(file);
      if(frames.length === 0) throw new Error("Could not extract frames from the video.");
      
      setLoadingMessage('AI is analyzing your video...');
      const result = await getMusicRecommendationsForVideo(frames);
      setAnalysisResult(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [extractFrames]);

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    analyzeVideo(file);
  };
  
  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button onClick={resetState} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Try Again
          </button>
        </div>
      );
    }

    if (videoUrl && analysisResult) {
      return <RecommendationDisplay videoUrl={videoUrl} analysis={analysisResult} />;
    }

    if (videoUrl && isLoading) {
       return (
        <div className="relative w-full h-full flex items-center justify-center">
            <video src={videoUrl} className="w-full h-full object-contain opacity-20" muted loop autoPlay/>
            <Loader message={loadingMessage} />
        </div>
       );
    }
    
    return <VideoUpload onVideoUpload={handleVideoUpload} />;
  }

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-center">
          <span className="text-purple-400">Video Soundtrack AI</span>
        </h1>
      </header>
      <div className="flex-grow flex items-center justify-center p-4">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;
