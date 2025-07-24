"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { VaultCrypto, PinManager } from "../../../lib/crypto";
import { useAuthStore } from "../../../store/auth";

type RecordType = "text" | "audio" | "video";
type TriggerType = "fixed_date" | "inactivity";

export default function RecordScreen() {
  const [recordType, setRecordType] = useState<RecordType>("text");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState<Blob | string | null>(null);
  const [triggerType, setTriggerType] = useState<TriggerType>("fixed_date");
  const [triggerValue, setTriggerValue] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const router = useRouter();
  const { user, deviceId } = useAuthStore();

  const startRecording = async () => {
    try {
      let stream: MediaStream;
      
      if (recordType === "audio") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else if (recordType === "video") {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } else {
        return; // 文本类型不需要录制
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: recordType === "audio" ? "audio/webm" : "video/webm",
        });
        setRecordedData(recordedBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      alert("Failed to start recording. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!recordedData && recordType !== "text") {
      alert("No content to upload");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!triggerValue.trim()) {
      alert("Please set trigger condition");
      return;
    }

    const pin = PinManager.getPin();
    if (!pin) {
      alert("PIN not found. Please set up your PIN first.");
      return;
    }

    const userUid = user?.id || deviceId;
    setUploading(true);

    try {
      let fileData: ArrayBuffer;
      let fileName: string;
      let mimeType: string;

      if (recordType === "text") {
        const textContent = recordedData as string;
        fileData = new TextEncoder().encode(textContent);
        fileName = `${title.replace(/\s+/g, "_")}.txt`;
        mimeType = "text/plain";
      } else {
        const blob = recordedData as Blob;
        fileData = await blob.arrayBuffer();
        fileName = `${title.replace(/\s+/g, "_")}.${recordType === "audio" ? "webm" : "mp4"}`;
        mimeType = blob.type;
      }

      // 加密文件数据
      const encrypted = await VaultCrypto.encryptFile(fileData, pin, userUid);
      const encryptedBase64 = VaultCrypto.encodeEncryptedData(encrypted.iv, encrypted.ciphertext);

      // 模拟上传 (实际应调用 API)
      console.log("Uploading encrypted data:", {
        title,
        type: recordType,
        trigger: triggerType,
        triggerValue,
        encryptedData: encryptedBase64.slice(0, 100) + "...", // 仅显示前100字符
        size: encryptedBase64.length,
      });

      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert("Message uploaded successfully!");
      router.push("/vault");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen gap-6 py-8 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-display mb-2">Create Legacy Message</h1>
        <p className="text-accent">Record a message for your loved ones</p>
      </div>

      <div className="max-w-lg mx-auto w-full space-y-6">
        {/* 消息类型选择 */}
        <div>
          <label className="block text-sm font-medium mb-3">Message Type</label>
          <div className="grid grid-cols-3 gap-3">
            {(["text", "audio", "video"] as RecordType[]).map((type) => (
              <button
                key={type}
                onClick={() => setRecordType(type)}
                className={`p-4 rounded-lg border transition ${
                  recordType === type
                    ? "border-primary bg-primary/10"
                    : "border-gray-600 hover:border-gray-500"
                }`}
              >
                <div className="text-2xl mb-1">
                  {type === "text" ? "📝" : type === "audio" ? "🎙️" : "🎥"}
                </div>
                <div className="text-sm capitalize">{type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 标题输入 */}
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Final message to family"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          />
        </div>

        {/* 内容录制区域 */}
        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          
          {recordType === "text" ? (
            <textarea
              value={recordedData as string || ""}
              onChange={(e) => setRecordedData(e.target.value)}
              placeholder="Write your message here..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white h-32 resize-none"
            />
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              {!recordedData ? (
                <>
                  <div className="text-4xl mb-4">
                    {recordType === "audio" ? "🎙️" : "🎥"}
                  </div>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-6 py-3 rounded-md transition ${
                      isRecording
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-primary hover:opacity-90"
                    } text-white font-medium`}
                  >
                    {isRecording ? "Stop Recording" : `Start ${recordType} Recording`}
                  </button>
                  {isRecording && (
                    <p className="text-sm text-accent mt-2">Recording in progress...</p>
                  )}
                </>
              ) : (
                <div>
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-success mb-4">Recording completed</p>
                  <button
                    onClick={() => setRecordedData(null)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                  >
                    Record Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 触发条件 */}
        <div>
          <label className="block text-sm font-medium mb-3">Delivery Trigger</label>
          
          <div className="space-y-3">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="fixed_date"
                  checked={triggerType === "fixed_date"}
                  onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                  className="text-primary"
                />
                On specific date
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="inactivity"
                  checked={triggerType === "inactivity"}
                  onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                  className="text-primary"
                />
                After inactivity
              </label>
            </div>
            
            {triggerType === "fixed_date" ? (
              <input
                type="date"
                value={triggerValue}
                onChange={(e) => setTriggerValue(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                min={new Date().toISOString().split("T")[0]}
              />
            ) : (
              <select
                value={triggerValue}
                onChange={(e) => setTriggerValue(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              >
                <option value="">Select period</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
                <option value="2 years">2 years</option>
              </select>
            )}
          </div>
        </div>

        {/* 上传按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/vault")}
            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !recordedData || !title.trim() || !triggerValue.trim()}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 transition font-medium"
          >
            {uploading ? "Encrypting & Uploading..." : "Save to Vault"}
          </button>
        </div>
      </div>
    </main>
  );
} 