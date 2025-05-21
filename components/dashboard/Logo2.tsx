import Link from "next/link"

export default function Logo2({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "h-8",
    default: "h-10",
    large: "h-12",
  }

  return (
    <Link href="/" className="flex items-center">
      <div className={`flex items-center ${sizeClasses[size]}`}>
        <div
          className={`relative ${sizeClasses[size]} aspect-square overflow-hidden rounded-full bg-[#0f2557] flex items-center justify-center`}
        >
          <span
            className={`text-white font-bold ${size === "small" ? "text-lg" : size === "large" ? "text-2xl" : "text-xl"}`}
          >
            T
          </span>
        </div>
        <span
          className={`ml-2 font-bold ${size === "small" ? "text-lg" : size === "large" ? "text-2xl" : "text-xl"} text-[#0f2557]`}
        >
          TRAKIT
        </span>
      </div>
    </Link>
  )
}
