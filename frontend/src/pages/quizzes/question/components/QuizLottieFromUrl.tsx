// src/pages/components/QuizLottieFromUrl.tsx
import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function QuizLottieFromUrl({ url, ...props }: { url: string, [key: string]: any }) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setAnimationData);
  }, [url]);

  if (!animationData) return null;

  return <Lottie animationData={animationData} loop autoplay {...props} />;
}
