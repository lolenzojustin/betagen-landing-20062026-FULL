"use client";

import Image from "next/image";

const prizes = [
  {
    count: "1",
    name: "Tai nghe\nBluetooth chụp\ntai Beats Solo 4",
    image: "/images/03-section-prize-note/prize-headphone.png",
    alt: "Tai nghe Bluetooth chụp tai Beats Solo 4",
    card: { left: 12, top: 42, width: 398, height: 166 },
    number: { left: 28, top: 45, size: 70 },
    text: { left: 110, top: 46, width: 178 },
    gift: { left: -12, top: 136, size: 48 },
    imageBox: { left: 242, top: -34, width: 178 },
  },
  {
    count: "1",
    name: "Nồi chiên\nkhông dầu\nPhilips",
    image: "/images/03-section-prize-note/prize-rice-cooker.png",
    alt: "Nồi chiên không dầu Philips",
    card: { left: 445, top: 42, width: 452, height: 166 },
    number: { left: 34, top: 50, size: 66 },
    text: { left: 116, top: 52, width: 156 },
    gift: { left: -12, top: 136, size: 48 },
    imageBox: { left: 230, top: -18, width: 214 },
  },
  {
    count: "3",
    name: "Máy xay sinh tố\ncầm tay Bear",
    image: "/images/03-section-prize-note/prize-blender.png",
    alt: "Máy xay sinh tố cầm tay Bear",
    card: { left: 910, top: 42, width: 370, height: 166 },
    number: { left: 30, top: 46, size: 72 },
    text: { left: 110, top: 62, width: 174 },
    gift: { left: -12, top: 136, size: 48 },
    imageBox: { left: 250, top: -44, width: 152 },
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
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 100%)",
              boxShadow:
                "0 12px 30px rgba(53, 74, 147, 0.08), inset 0 1px 0 rgba(255,255,255,0.42)",
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
              fontSize: "18px",
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
