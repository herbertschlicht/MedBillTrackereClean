
import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Kamera-Zugriff verweigert oder nicht verfügbar.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 jpeg
        const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {error ? (
        <div className="text-white text-center p-6">
          <i className="fas fa-exclamation-triangle text-4xl mb-4 text-yellow-500"></i>
          <p className="mb-6">{error}</p>
          <button onClick={onClose} className="bg-white text-black px-6 py-2 rounded-full font-bold">Schließen</button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          {/* Scanning Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
             <div className="w-4/5 h-3/5 border-2 border-white/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
             </div>
             <p className="text-white/80 text-sm mt-8 bg-black/40 px-4 py-2 rounded-full">Rechnung im Rahmen platzieren</p>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* UI Controls */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none">
            <button 
              onClick={onClose} 
              className="pointer-events-auto bg-black/40 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/60"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-10 flex justify-center items-center">
            <button 
              onClick={capturePhoto}
              disabled={!isStreaming}
              className="w-20 h-20 bg-white rounded-full p-1 border-4 border-gray-400/50 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
            >
              <div className="w-16 h-16 bg-white border-2 border-black/10 rounded-full"></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraView;
