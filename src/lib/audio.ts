export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Use mp3 if supported, otherwise fallback to wav
      const mimeType = MediaRecorder.isTypeSupported("audio/mp3")
        ? "audio/mp3"
        : MediaRecorder.isTypeSupported("audio/wav")
          ? "audio/wav"
          : "audio/webm";

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      this.chunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      return false;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return;

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, {
          type: this.mediaRecorder?.mimeType || "audio/mp3",
        });
        this.chunks = [];
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }
}
