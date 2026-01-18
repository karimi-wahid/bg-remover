import { removeBackground } from "@imgly/background-removal";
import { useEffect, useState } from "react";

const App = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (originalImage) URL.revokeObjectURL(originalImage);
      if (resultImage) URL.revokeObjectURL(resultImage);
    };
  }, [originalImage, resultImage]);

  const processImage = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;

    setResultImage(null);
    setIsLoading(true);

    const originalUrl = URL.createObjectURL(file);
    setOriginalImage(originalUrl);

    try {
      const resultBlob = await removeBackground(file);
      const resultUrl = URL.createObjectURL(resultBlob);
      setResultImage(resultUrl);
    } catch (error) {
      console.error(error);
      alert("An error occurred while processing the image.");
    }
  };
  return <div></div>;
};

export default App;
