import React, { useState } from "react";
import Image from "next/image";

const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc,
  className = "",
}: {
  src: string;
  alt: string;
  fallbackSrc: string;
  className?: string;
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div className="relative w-full h-full">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={`object-contain ${className}`}
        onError={() => setImgSrc(fallbackSrc)}
      />
    </div>
  );
};

export default ImageWithFallback;
