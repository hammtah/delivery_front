import { motion } from "framer-motion";

export default function GlowingHeartCircle({ size = "12px", color = "green" }) {
  const colorMap = {
    green: "bg-green-500",
    red: "bg-red-500"
  };

  return (
    <div className="relative">
      {/* Blur effect */}
      <div 
        className={`absolute inset-0 rounded-full blur-md animate-pulse ${
          colorMap[color]
        } opacity-70`}
        style={{ width: size, height: size }}
      />
      {/* Main circle */}
      <div 
        className={`rounded-full ${colorMap[color]}`}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
