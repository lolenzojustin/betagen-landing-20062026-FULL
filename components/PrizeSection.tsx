"use client";

import Image from "next/image";

const prizes = [
  {
    count: "1",
    name: "Tai nghe\nBluetooth chụp\ntai Beats Solo 4",
    image: "/images/03-section-prize-note/prize-headphone.png",
    alt: "Tai nghe Bluetooth chụp tai Beats Solo 4",
    card: { left: 20, top: 55, width: 390, height: 150 },
    number: { left: 20, top: 28, size: 82 },
    text: { left: 96, top: 36, width: 170 },
    gift: { left: -19, top: 124, size: 46 },
    imageBox: { left: 235, top: -42, width: 175 },
  },
  {
    count: "1",
    name: "Nồi chiên\nkhông dầu\nPhilips",
    image: "/images/03-section-prize-note/prize-rice-cooker.png",
    alt: "Nồi chiên không dầu Philips",
    card: { left: 455, top: 55, width: 450, height: 150 },
    number: { left: 28, top: 39, size: 74 },
    text: { left: 108, top: 46, width: 150 },
    gift: { left: -14, top: 124, size: 46 },
    imageBox: { left: 226, top: -28, width: 218 },
  },
  {
    count: "3",
    name: "Máy xay sinh tố\ncầm tay Bear",
    image: "/images/03-section-prize-note/prize-blender.png",
    alt: "Máy xay sinh tố cầm tay Bear",
    card: { left: 910, top: 55, width: 376, height: 150 },
    number: { left: 27, top: 29, size: 86 },
    text: { left: 102, top: 56, width: 175 },
    gift: { left: -13, top: 124, size: 46 },
    imageBox: { left: 246, top: -55, width: 150 },
  },
];

export default function PrizeSection() {
  return (
    <div className="relative h-full w-full">
      {prizes.map((prize) => (
        <div
          key={prize.alt}
          className="absolute"
          style={{
            left: `${prize.card.left}px`,
            top: `${prize.card.top}px`,
            width: `${prize.card.width}px`,
            height: `${prize.card.height}px`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.82)",
              borderRadius: "19px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
            }}
          />

          <span
            className="absolute font-black leading-none text-[#EA0029]"
            style={{
              left: `${prize.number.left}px`,
              top: `${prize.number.top}px`,
              fontSize: `${prize.number.size}px`,
            }}
          >
            {prize.count}
          </span>

          <p
            className="absolute whitespace-pre-line font-black leading-[1.18] text-[#354A93]"
            style={{
              left: `${prize.text.left}px`,
              top: `${prize.text.top}px`,
              width: `${prize.text.width}px`,
              fontSize: "20px",
            }}
          >
            {prize.name}
          </p>

          <Image
            src="/icons/gift.svg"
            alt=""
            width={46}
            height={46}
            className="absolute h-auto object-contain"
            style={{
              left: `${prize.gift.left}px`,
              top: `${prize.gift.top}px`,
              width: `${prize.gift.size}px`,
            }}
            aria-hidden="true"
          />

          <Image
            src={prize.image}
            alt={prize.alt}
            width={260}
            height={320}
            className="absolute h-auto object-contain"
            style={{
              left: `${prize.imageBox.left}px`,
              top: `${prize.imageBox.top}px`,
              width: `${prize.imageBox.width}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
