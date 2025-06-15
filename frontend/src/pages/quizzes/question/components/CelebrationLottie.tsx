// src/pages/quizzes/question/components/CelebrationLottie.tsx
import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function CelebrationLottie({ error = false, style = {} }) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch(error ? "/lotties/error.json" : "/lotties/celebration.json")
      .then(res => res.json())
      .then(setAnimationData);
  }, [error]);

  if (!animationData) return null;

  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay
      style={{ width: 140, height: 140, ...style }}
    />
  );
}
