"use client";

import React, { useEffect, useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import { Sparkles, Upload, ImageIcon, Check, X, Download } from "lucide-react";
import {
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider,
} from "../components/motion-primitives/image-comparison";
import { TextShimmerWave } from "../components/motion-primitives/text-shimmer-wave";

export default function BgRemoverPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (originalImage && originalImage.startsWith("blob:"))
        URL.revokeObjectURL(originalImage);
      if (resultImage && resultImage.startsWith("blob:"))
        URL.revokeObjectURL(resultImage);
    };
  }, [originalImage, resultImage]);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(0);
    }
  }, [isLoading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImage(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImage(e.target.files[0]);
    }
  };

  const processImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const image = e.target?.result as string;
      setOriginalImage(image);
      setIsLoading(true);
      setLoadingProgress(0);

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 200);

      try {
        const result = await removeBackground(image);
        clearInterval(progressInterval);
        setLoadingProgress(100);

        let resultSrc: string | null = null;

        if (typeof result === "string") {
          resultSrc = result;
        } else if (result instanceof Blob) {
          resultSrc = URL.createObjectURL(result);
        } else if (
          result &&
          typeof result === "object" &&
          (result instanceof ArrayBuffer || ArrayBuffer.isView(result))
        ) {
          try {
            const blob = new Blob([result as any], { type: "image/png" });
            resultSrc = URL.createObjectURL(blob);
          } catch (e) {
            console.warn("Could not convert ArrayBuffer result to blob:", e);
          }
        } else {
          console.warn("Unknown result type from removeBackground:", result);
        }

        if (resultSrc) setResultImage(resultSrc);
      } catch (error) {
        console.error("Error removing background:", error);
        clearInterval(progressInterval);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetImages = () => {
    setOriginalImage(null);
    setResultImage(null);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-cyan-700/20 via-transparent to-transparent"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-4 flex-col sm:flex-row">
            <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/50">
              <Sparkles className="w-6 h-6" />
            </div>
            <TextShimmerWave
              className="text-xl sm:text-2xl lg:text-4xl font-bold bg-linear-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent"
              duration={1}
              spread={1}
              zDistance={1}
              scaleDistance={1.1}
              rotateYDistance={20}
            >
              BG Remover AI
            </TextShimmerWave>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Instantly remove backgrounds with AI. Runs entirely in your browser
            — no server, no API key, complete privacy.
          </p>
        </header>

        {!originalImage && !resultImage && (
          <section
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group rounded-3xl border-2 border-dashed transition-all duration-300 backdrop-blur-xl p-6 sm:p-8 md:p-12 text-center mb-8 ${
              isDragging
                ? "border-cyan-400 bg-cyan-500/20 scale-105 shadow-2xl shadow-cyan-500/50"
                : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
            }`}
          >
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div
                className={`p-6 rounded-full bg-linear-to-br from-blue-500/20 to-cyan-500/20 transition-transform duration-300 ${
                  isDragging ? "scale-110" : "group-hover:scale-105"
                }`}
              >
                <Upload className="w-12 sm:w-16 h-12 sm:h-16 text-cyan-400" />
              </div>

              <div>
                <p className="text-xl sm:text-2xl font-bold mb-2">
                  Drop your image here
                </p>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                  or click below to browse
                </p>
              </div>

              <label
                htmlFor="input"
                className="inline-flex items-center gap-2 sm:gap-3 cursor-pointer bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105"
              >
                <ImageIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                Select Image
              </label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
                id="input"
              />

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mt-2">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
                  JPG, PNG supported
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
                  No uploads to server
                </span>
              </div>
            </div>
          </section>
        )}

        {isLoading && (
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"></div>
              </div>
              <p className="text-lg sm:text-xl font-bold mb-2">
                Processing with AI...
              </p>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                Removing background
              </p>
              <div className="w-48 sm:w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-300 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {originalImage && resultImage && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
                Compare Results
              </h2>
              <button
                onClick={resetImages}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
              >
                <X className="w-4 h-4" />
                New Image
              </button>
            </div>

            <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[60%] mx-auto mb-6">
              <ImageComparison className="aspect-16/10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white">
                <ImageComparisonImage
                  src={originalImage || "/placeholder.svg"}
                  alt="Original"
                  position="right"
                />
                <ImageComparisonImage
                  src={resultImage || "/placeholder.svg"}
                  alt="Result"
                  position="left"
                />
                <ImageComparisonSlider className="w-2 bg-white/50 backdrop-blur-xs transition-colors hover:bg-white/80">
                  <div className="absolute left-1/2 top-1/2 h-8 w-6 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-white" />
                </ImageComparisonSlider>
              </ImageComparison>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={resultImage}
                download={Date.now() + "-bg-removed.png"}
                className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 font-bold text-sm sm:text-base shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105"
              >
                <Download className="w-4 sm:w-5 h-4 sm:h-5" />
                Download PNG
              </a>
            </div>
          </div>
        )}

        <footer className="mt-12 sm:mt-16 text-center">
          <div className="inline-block p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <p className="text-gray-400 mb-1 text-sm sm:text-base">
              100% Client-Side Processing
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Developed by: Wahidullah Karimi
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
