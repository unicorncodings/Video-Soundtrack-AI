
import React, { useCallback, useState } from 'react';
import { VideoIcon } from './icons';

interface VideoUploadProps {
  onVideoUpload: (file: File) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onVideoUpload(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      if(event.dataTransfer.files[0].type.startsWith('video/')) {
        onVideoUpload(event.dataTransfer.files[0]);
      } else {
        alert("Please upload a valid video file.");
      }
    }
  }, [onVideoUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`w-full max-w-2xl p-8 border-4 border-dashed rounded-xl transition-colors duration-300 ${isDragging ? 'border-purple-500 bg-gray-800' : 'border-gray-600 hover:border-purple-400'}`}
      >
        <label htmlFor="video-upload" className="flex flex-col items-center justify-center text-center cursor-pointer">
          <VideoIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Upload Your Video</h2>
          <p className="text-gray-400">Drag & drop a video file here or click to select</p>
          <p className="text-xs text-gray-500 mt-2">MP4, MOV, AVI, etc.</p>
        </label>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default VideoUpload;
