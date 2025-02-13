import React, { useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Mic, Upload, Pause, Square, Play, Loader2, Wand2 } from "lucide-react";
import { useAudioStore } from "@/lib/store";
import { AudioRecorder } from "@/lib/audio";
import { transcribeAudio, generateArticleContent } from "@/lib/ai";

const AudioUploader: React.FC = () => {
  const {
    isRecording,
    recordingTime,
    setIsRecording,
    setRecordingTime,
    setAudioBlob,
    audioBlob,
    isProcessing,
    setIsProcessing,
    setFacts,
    setQuotes,
    setArticleContent,
  } = useAudioStore();

  const audioRecorder = useRef(new AudioRecorder());
  const timerRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const transcription = await transcribeAudio(blob);
      const articleContent = await generateArticleContent(transcription);
      setArticleContent(articleContent);
      console.log("Setting facts:", articleContent.facts);
      setFacts(articleContent.facts || []);
      setQuotes(articleContent.quotes || []);
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Get file extension
      const extension = file.name.split(".").pop()?.toLowerCase();

      // Check if it's a supported format
      const supportedFormats = [
        "flac",
        "m4a",
        "mp3",
        "mp4",
        "mpeg",
        "mpga",
        "oga",
        "ogg",
        "wav",
        "webm",
      ];

      if (extension && supportedFormats.includes(extension)) {
        setAudioBlob(file);
      } else {
        alert(
          `Unsupported file format. Please upload one of these formats: ${supportedFormats.join(", ")}`,
        );
      }
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      const started = await audioRecorder.current.startRecording();
      if (started) {
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime((prevTime: number) => prevTime + 1);
        }, 1000);
      }
    } else {
      const blob = await audioRecorder.current.stopRecording();
      setIsRecording(false);
      setAudioBlob(blob);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (audioRef.current && audioBlob) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  return (
    <Card className="w-full bg-white p-6 shadow-lg">
      <div className="space-y-6">
        <audio
          ref={audioRef}
          className="hidden"
          onEnded={() => setIsPlaying(false)}
        />

        {/* Upload Section */}
        <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg relative">
          <Input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Upload className="h-6 w-6 text-gray-600" />
            <span className="text-gray-600">Upload Audio File</span>
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const response = await fetch("/avhort-kort.mp3");
                const blob = await response.blob();
                const file = new File([blob], "avhort-kort.mp3", {
                  type: "audio/mp3",
                });
                setAudioBlob(file);
              } catch (error) {
                console.error("Error loading demo file:", error);
                alert("Error loading demo file");
              }
            }}
            className="absolute bottom-2 right-2 text-xs"
          >
            Try Demo
          </Button>
        </div>

        {/* Recording and Controls Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleRecording}
                className={isRecording ? "text-red-500" : ""}
              >
                {isRecording ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              {audioBlob && (
                <Button variant="outline" size="icon" onClick={togglePlayback}>
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              )}
              {audioBlob && !isProcessing && (
                <Button
                  onClick={() => processAudio(audioBlob)}
                  className="flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate Article
                </Button>
              )}
            </div>
            {isProcessing && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing audio...</span>
              </div>
            )}
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="animate-pulse h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600">
                  {formatTime(recordingTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AudioUploader;
