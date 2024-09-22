import { motion } from "framer-motion";
import Image from "next/image";

export default function Background() {
  return (
    <div className="fixed inset-0 z-0">
      <Image
        src="/homepagebg.png" // The path to your background image
        alt="Restaurant Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
      />
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2 }}
      />
    </div>
  );
}
