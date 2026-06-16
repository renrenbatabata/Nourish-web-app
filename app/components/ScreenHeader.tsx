"use client";

import Image from "next/image";

type Props = {
  source: string; // Web版では画像のパスを文字列で受け取ります
  height?: number; // カスタムの高さ（オプション）
};

export function ScreenHeader({ source, height = 100 }: Props) {
  return (
    <div
      className="w-[99.8%] bg-[#f8d9df] overflow-hidden rounded-b-2xl mx-auto relative"
      style={{ height: `${height}px` }} // 高さをピクセル単位で柔軟に指定
    >
      <Image
        src={source}
        alt="Screen Header"
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, 100vw"
        loading="eager"
      />
    </div>
  );
}
