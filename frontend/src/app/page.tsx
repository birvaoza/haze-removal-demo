"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, ImageIcon, Github, ArrowLeft } from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [dehazedImage, setDehazedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDehazedImage(null);

    // Show original
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Send to API
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDehazedImage(url);
    } catch (err) {
      setError(
        "Could not connect to the inference API. The backend may not be running. Showing demo mode."
      );
      // In demo mode, just mirror the original as a placeholder
      setDehazedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setDehazedImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🌫️ Haze Removal</h1>
            <p className="text-sm text-gray-400">
              U-Net Image Dehazing • Upload → Process → Compare
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/birvaoza"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              <Github size={18} />
            </a>
            <a
              href="https://birvaoza-portfolio.vercel.app"
              className="text-sm px-3 py-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Portfolio
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          {!originalImage ? (
            /* Upload state */
            <div className="text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-2xl p-16 hover:border-indigo-500/50 hover:bg-gray-900/50 transition-all cursor-pointer group"
              >
                <Upload
                  size={48}
                  className="mx-auto text-gray-600 group-hover:text-indigo-400 transition-colors mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-300 mb-2">
                  Upload a hazy image
                </h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Drop an image or click to upload. The U-Net model will remove
                  haze and return a clear version.
                </p>
                <p className="text-gray-600 text-xs mt-4">
                  Supports: JPG, PNG • Resized to 256×256 for inference
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />

              {/* Architecture info */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 border border-gray-800 rounded-xl bg-gray-900/30">
                  <h3 className="text-sm font-medium text-gray-300 mb-1">
                    Model
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    U-Net 2D • [16,32,64,128,256]
                  </p>
                </div>
                <div className="p-4 border border-gray-800 rounded-xl bg-gray-900/30">
                  <h3 className="text-sm font-medium text-gray-300 mb-1">
                    Training
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    SSIM Loss • Adam • Indoor/Outdoor
                  </p>
                </div>
                <div className="p-4 border border-gray-800 rounded-xl bg-gray-900/30">
                  <h3 className="text-sm font-medium text-gray-300 mb-1">
                    Impact
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    +25% mAP on downstream detection
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Result state */
            <div>
              <button
                onClick={reset}
                className="mb-6 text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={14} />
                Upload another image
              </button>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2
                    size={40}
                    className="text-indigo-400 animate-spin mb-4"
                  />
                  <p className="text-gray-400">
                    Running inference through U-Net...
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Model: 256×256 input • SSIM optimized
                  </p>
                </div>
              ) : dehazedImage ? (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-center">
                    Before / After Comparison
                  </h2>
                  <BeforeAfterSlider
                    beforeSrc={originalImage}
                    afterSrc={dehazedImage}
                  />
                  <p className="text-center text-gray-500 text-sm mt-4">
                    ← Drag the slider to compare →
                  </p>
                </div>
              ) : (
                <div>
                  {error && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                      <p className="text-amber-400 text-sm">{error}</p>
                    </div>
                  )}
                  <div className="border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-2 bg-gray-900 text-center text-xs text-gray-500">
                      Uploaded Image (Original Hazy)
                    </div>
                    <img
                      src={originalImage}
                      alt="Uploaded hazy image"
                      className="w-full max-h-[500px] object-contain bg-black"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-gray-600">
          <span>Built by Birva Oza</span>
          <span>TensorFlow • FastAPI • Next.js</span>
        </div>
      </footer>
    </main>
  );
}
