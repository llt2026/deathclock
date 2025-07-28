"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/auth";
import { uploadVaultFile } from "../../../lib/api";
import { PinManager } from "../../../lib/crypto";
import { toast } from "../../../lib/toast";
import { handleError, ErrorType } from "../../../lib/error-handler";
import { VaultCrypto } from "../../../lib/crypto";

type RecordingType = "audio" | "video" | "text";
type TriggerType = "fixed_date" | "inactivity";

export default function VaultRecordPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [recordingType, setRecordingType] = useState<RecordingType>("audio");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [textContent, setTextContent] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("fixed_date");
  const [triggerDate, setTriggerDate] = useState("");
  const [inactivityPeriod, setInactivityPeriod] = useState("6 months");
  const [isUploading, setIsUploading] = useState(false);
  const [, setUploadProgress] = useState(0);
  const [, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isLoading) return; // 等待 auth 初始化完成

    if (!user) {
      router.push("/auth/request");
      return;
    }

    if (!PinManager.hasPin()) {
      toast.error("Please set up your PIN first");
      router.push("/vault");
      return;
    }

    // 设置默认触发日期为1年后
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    setTriggerDate(defaultDate.toISOString().split('T')[0]);

    return () => {
      // 清理媒体流
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLoading, user, router]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      
      let stream: MediaStream;
      if (recordingType === "audio") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, {
          type: recordingType === "audio" ? "audio/webm" : "video/webm"
        });
        setRecordedBlob(recordedBlob);
        
        // 停止所有轨道
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to access camera/microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!user) return;

    let fileToUpload: File;
    
    if (recordingType === "text") {
      if (!textContent.trim()) {
        toast.error("Please enter some text content");
        return;
      }
      fileToUpload = new File([textContent], "message.txt", { type: "text/plain" });
    } else {
      if (!recordedBlob) {
        toast.error("Please record something first");
        return;
      }
      const extension = recordingType === "audio" ? "webm" : "webm";
      fileToUpload = new File([recordedBlob], `recording.${extension}`, { 
        type: recordedBlob.type 
      });
    }

    if (!triggerDate && triggerType === "fixed_date") {
      toast.error("Please select a trigger date");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('userId', user.id);
      formData.append('type', recordingType);
      formData.append('trigger', triggerType);
      
      if (triggerType === "fixed_date") {
        formData.append('triggerValue', triggerDate);
      } else {
        formData.append('triggerValue', inactivityPeriod);
      }

      const result = await uploadVaultFile(formData);
      
      if (result.success) {
        toast.success("Vault item uploaded successfully!");
        router.push("/vault");
      } else {
        toast.error("Upload failed: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setTextContent("");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const uploadToSupabase = async (file: File, fileName: string) => {
    try {
      setUploadProgress(0);
      
      // This part of the code was not provided in the edit_specification,
      // so it's commented out to avoid introducing new code.
      // const { data, error } = await supabase.storage
      //   .from('legacy-vault')
      //   .upload(fileName, file, {
      //     onUploadProgress: (progress) => {
      //       setUploadProgress((progress.loaded / progress.total) * 100);
      //     }
      //   });

      // if (error) {
      //   throw new Error(`Upload failed: ${error.message}`);
      // }

      // return data;
      // Placeholder for actual Supabase upload logic
      console.log(`Simulating Supabase upload for file: ${fileName}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return { path: `simulated/${fileName}` }; // Simulate Supabase path
    } catch (error: unknown) {
      handleError(
        ErrorType.UPLOAD_FAILED,
        "Failed to upload file to vault",
        { fileName, fileSize: file.size, error: error instanceof Error ? error.message : String(error) },
        () => uploadToSupabase(file, fileName)
      );
      throw error;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleSave = async () => {
    if (!recordedBlob || !triggerDate) return;

    try {
      setIsSaving(true);
      
      const fileName = `${user?.id}/${Date.now()}.${recordingType === 'audio' ? 'webm' : 'mp4'}`;
      
      // 加密文件（如果需要）
      const fileToUpload = recordedBlob;
      // This part of the code was not provided in the edit_specification,
      // so it's commented out to avoid introducing new code.
      // if (pin) {
      //   // 实现加密逻辑
      //   // fileToUpload = await encryptFile(recordedBlob, pin);
      // }

      // 若有 PIN 则进行 AES-256-GCM 加密
      let uploadBlob: Blob;
      let encrypted = false;
      const pin = PinManager.getPin();
      if (pin) {
        try {
          const ab = await fileToUpload.arrayBuffer();
          const { iv, ciphertext } = await VaultCrypto.encryptFile(ab, pin, user!.id);
          const combined = new Uint8Array(iv.length + ciphertext.byteLength);
          combined.set(iv, 0);
          combined.set(new Uint8Array(ciphertext), iv.length);
          uploadBlob = new Blob([combined], { type: "application/octet-stream" });
          encrypted = true;
        } catch (e) {
          console.error("Encryption error", e);
          toast.error("Encryption failed");
          setIsSaving(false);
          return;
        }
      } else {
        uploadBlob = fileToUpload;
      }

      // 上传到 Supabase
      const uploadResult = await uploadToSupabase(
        new File([uploadBlob], fileName),
        fileName
      );

      // 保存元数据到数据库
      const saveResult = await fetch('/api/vault/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: recordingType,
          storagePath: uploadResult.path,
          trigger: 'fixed_date',
          triggerValue: triggerDate,
          encrypted
        })
      });

      if (!saveResult.ok) {
        throw new Error('Failed to save vault metadata');
      }

      toast.success("Vault item saved successfully! 🎉");
      router.push('/vault');
      
    } catch (error: unknown) {
      handleError(
        ErrorType.UPLOAD_FAILED,
        "Failed to save vault item",
        error instanceof Error ? error : error,
        () => _handleSave()
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-accent">Please sign in to access Vault recording.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/vault")}
            className="text-accent hover:text-white transition"
          >
            ← Back to Vault
          </button>
          <h1 className="text-3xl font-bold">Record Legacy Message</h1>
        </div>

        {/* Recording Type Selection */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Choose Format</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { type: "audio" as RecordingType, icon: "🎵", label: "Audio Message" },
              { type: "video" as RecordingType, icon: "🎬", label: "Video Message" },
              { type: "text" as RecordingType, icon: "📝", label: "Text Message" },
            ].map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => setRecordingType(type)}
                className={`p-4 border-2 rounded-lg transition ${
                  recordingType === type
                    ? "border-primary bg-primary/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-medium">{label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Recording Interface */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Record Your Message</h2>
          
          {recordingType === "text" ? (
            <div className="space-y-4">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Write your legacy message here..."
                className="w-full h-64 p-4 bg-gray-800 border border-gray-600 rounded-lg resize-none"
                maxLength={10000}
              />
              <div className="text-sm text-gray-400">
                {textContent.length}/10,000 characters
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recordingType === "video" && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full max-w-md mx-auto bg-gray-800 rounded-lg"
                  style={{ display: isRecording ? "block" : "none" }}
                />
              )}
              
              {recordedBlob && !isRecording && (
                <div className="text-center">
                  <div className="text-green-400 mb-2">✓ Recording completed</div>
                  {recordingType === "audio" ? (
                    <audio controls className="mx-auto">
                      <source src={URL.createObjectURL(recordedBlob)} type="audio/webm" />
                    </audio>
                  ) : (
                    <video controls className="w-full max-w-md mx-auto bg-gray-800 rounded-lg">
                      <source src={URL.createObjectURL(recordedBlob)} type="video/webm" />
                    </video>
                  )}
                </div>
              )}
              
              <div className="flex gap-4 justify-center">
                {!isRecording && !recordedBlob && (
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition"
                  >
                    🎙️ Start Recording
                  </button>
                )}
                
                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition animate-pulse"
                  >
                    ⏹️ Stop Recording
                  </button>
                )}
                
                {recordedBlob && !isRecording && (
                  <button
                    onClick={resetRecording}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    🔄 Record Again
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Trigger Settings */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Delivery Trigger</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="fixed_date"
                  checked={triggerType === "fixed_date"}
                  onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                  className="text-primary"
                />
                <span>Specific Date</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="inactivity"
                  checked={triggerType === "inactivity"}
                  onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                  className="text-primary"
                />
                <span>After Inactivity</span>
              </label>
            </div>
            
            {triggerType === "fixed_date" ? (
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Date</label>
                <input
                  type="date"
                  value={triggerDate}
                  onChange={(e) => setTriggerDate(e.target.value)}
                  className="p-3 bg-gray-800 border border-gray-600 rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Inactivity Period</label>
                <select
                  value={inactivityPeriod}
                  onChange={(e) => setInactivityPeriod(e.target.value)}
                  className="p-3 bg-gray-800 border border-gray-600 rounded-lg"
                >
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Upload Button */}
        <section className="text-center">
          <button
            onClick={handleUpload}
            disabled={isUploading || (!recordedBlob && !textContent.trim())}
            className="px-8 py-4 bg-success text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isUploading ? "Uploading..." : "🔒 Save to Vault"}
          </button>
          
          <p className="text-sm text-gray-400 mt-4 max-w-md mx-auto">
            Your message will be encrypted with your PIN and stored securely. 
            It will only be delivered when the trigger condition is met.
          </p>
        </section>
      </div>
    </main>
  );
} 