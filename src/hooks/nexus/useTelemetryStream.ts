import { useEffect, useRef, useState } from 'react';

export type StreamStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const useTelemetryStream = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<StreamStatus>('disconnected');

  useEffect(() => {
    setStatus('connecting');

    // MOCK LÉGER : On simule juste le temps de connexion au Cloud Run.
    // Zéro encodage vidéo, zéro charge CPU.
    const timer = setTimeout(() => {
      setStatus('connected');
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return { videoRef, status };
};