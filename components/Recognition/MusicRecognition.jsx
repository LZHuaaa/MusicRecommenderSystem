import {
  ArrowPathIcon,
  CheckCircleIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  StopIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';

const MusicRecognition = () => {
  const [recognitionMode, setRecognitionMode] = useState('idle'); // idle, recording, humming, processing, success, error
  const [recordingTime, setRecordingTime] = useState(0);
  const [recognizedSong, setRecognizedSong] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async (mode) => {
    try {
      setRecognitionMode(mode);
      setRecordingTime(0);
      setRecognizedSong(null);
      setError(null);
      audioChunksRef.current = [];

      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      console.log('Microphone access granted');

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Request data every 100ms
      mediaRecorder.start(100);
      console.log('MediaRecorder started');
      
      // Start timer for recording
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 8) {
            stopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check your permissions.');
      setRecognitionMode('error');
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Audio track stopped');
      });
    }
    clearInterval(timerRef.current);
    processRecording();
  };

  const processRecording = async () => {
    setRecognitionMode('processing');
    
    try {
      console.log('Creating audio blob from chunks');
      console.log('Number of chunks:', audioChunksRef.current.length);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      console.log('Audio blob size:', audioBlob.size);
      
      if (audioBlob.size === 0) {
        throw new Error('No audio data captured. Please try again.');
      }

      const formData = new FormData();
      formData.append('audio', audioBlob);
      console.log('FormData created with audio blob');

      console.log('Sending request to recognition endpoint');
      const response = await fetch('http://localhost:3000/api/recognition/match', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Received non-JSON response:', await response.text());
        throw new Error('Server returned an invalid response format');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Recognition error:', errorData);
        throw new Error(errorData.error || 'Failed to process audio');
      }

      const data = await response.json();
      console.log('Recognition response:', data);
      
      if (data.matches && data.matches.length > 0) {
        console.log('Found matches:', data.matches);
        setRecognitionMode('success');
        setRecognizedSong(data.matches[0]);
      } else {
        console.log('No matches found');
        setRecognitionMode('error');
        setError('No matching song found. Try again with a clearer recording.');
      }
    } catch (err) {
      console.error('Recognition error:', err);
      setRecognitionMode('error');
      setError(err.message || 'Failed to process audio. Please try again.');
    }
  };

  const reset = () => {
    setRecognitionMode('idle');
    setRecordingTime(0);
    setRecognizedSong(null);
    setError(null);
  };

  const formatTime = (seconds) => {
    return `0:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-card rounded-2xl p-6 md:p-8 shadow-lg"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-2">Music Recognition</h2>
        <p className="text-muted-foreground mb-6">
          Record a song playing around you or hum a melody to identify music
        </p>
      </motion.div>

      {/* Idle state - Choose recognition method */}
      {recognitionMode === 'idle' && (
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <button
            onClick={() => startRecording('recording')}
            className="flex flex-col items-center bg-secondary/50 hover:bg-secondary rounded-xl p-6 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MicrophoneIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Record Audio</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Identify music playing around you
            </p>
          </button>

          <button
            onClick={() => startRecording('humming')}
            className="flex flex-col items-center bg-secondary/50 hover:bg-secondary rounded-xl p-6 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MusicalNoteIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Hum a Tune</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Hum or sing to find a song
            </p>
          </button>
        </motion.div>
      )}

      {/* Recording State */}
      {(recognitionMode === 'recording' || recognitionMode === 'humming') && (
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center mb-6 animate-pulse">
              {recognitionMode === 'recording' ? (
                <MicrophoneIcon className="w-12 h-12 text-white" />
              ) : (
                <MusicalNoteIcon className="w-12 h-12 text-white" />
              )}
            </div>
            
            {/* Audio waves animation */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 -z-10">
              <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-2 border-red-500/40 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">
            {recognitionMode === 'recording' ? 'Listening...' : 'Humming...'}
          </h3>
          <p className="text-lg font-mono mb-6">{formatTime(recordingTime)}</p>
          <button 
            onClick={stopRecording}
            className="button-primary flex items-center space-x-2"
          >
            <StopIcon className="w-5 h-5" />
            <span>Stop</span>
          </button>
        </motion.div>
      )}

      {/* Processing State */}
      {recognitionMode === 'processing' && (
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center"
        >
          <ArrowPathIcon className="w-16 h-16 text-primary animate-spin mb-6" />
          <h3 className="text-xl font-semibold mb-2">Identifying Song...</h3>
          <p className="text-muted-foreground text-center">
            Comparing audio fingerprint to our database
          </p>
        </motion.div>
      )}

      {/* Success State */}
      {recognitionMode === 'success' && recognizedSong && (
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center"
        >
          <CheckCircleIcon className="w-16 h-16 text-green-500 mb-6" />
          <h3 className="text-xl font-semibold mb-6">Song Identified!</h3>
          
          <div className="w-full max-w-sm bg-secondary/50 rounded-xl p-4 flex items-center space-x-4">
            <img 
              src={recognizedSong.image_url || 'https://source.unsplash.com/random/300x300?music'} 
              alt={recognizedSong.title} 
              className="w-16 h-16 rounded object-cover"
            />
            <div>
              <h4 className="font-semibold">{recognizedSong.title}</h4>
              <p className="text-sm text-muted-foreground">{recognizedSong.artist_name}</p>
              <p className="text-xs text-muted-foreground">
                Match confidence: {Math.round(recognizedSong.similarity * 100)}%
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button className="button-primary">
              Play Song
            </button>
            <button className="button-secondary">
              Add to Playlist
            </button>
          </div>
          
          <button 
            onClick={reset}
            className="mt-6 text-sm text-primary hover:underline"
          >
            Identify Another Song
          </button>
        </motion.div>
      )}

      {/* Error State */}
      {recognitionMode === 'error' && (
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center"
        >
          <XCircleIcon className="w-16 h-16 text-red-500 mb-6" />
          <h3 className="text-xl font-semibold mb-2">No Match Found</h3>
          <p className="text-muted-foreground text-center mb-6">
            {error || "We couldn't identify the song. Try again with a clearer recording or a different section of the song."}
          </p>
          <button 
            onClick={reset}
            className="button-primary"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Tips Section */}
      {recognitionMode === 'idle' && (
        <motion.div 
          variants={itemVariants}
          className="mt-8 border-t border-border pt-6"
        >
          <h3 className="font-semibold mb-3">Tips for best results:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Hold your device close to the music source when recording
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Record for at least 5 seconds for better accuracy
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              When humming, try to match the melody as closely as possible
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Minimize background noise for better recognition
            </li>
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MusicRecognition; 