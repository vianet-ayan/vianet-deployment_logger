"use client"

import { Globe } from "@/components/ui/globe"
import { IconCloud } from "@/components/ui//icon-cloud" // or "@/components/magicui/icon-cloud"
import logo from "../../public/VianetLogo.png"
import { motion, useScroll, useTransform } from "framer-motion"

// ================= BRAND LOGO INTERNET IMAGES =================
const brandLogos = [
  {
    name: "JBL",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/JBL_logo.svg/512px-JBL_logo.svg.png",
  },
  {
    name: "Samsung",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/512px-Samsung_Logo.svg.png",
  },
  {
    name: "Sennheiser",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Sennheiser_Logo.svg/512px-Sennheiser_Logo.svg.png",
  },
  {
    name: "Harman Kardon",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Harman_Kardon_logo.svg/512px-Harman_Kardon_logo.svg.png",
  },
  {
    name: "Nothing",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Nothing_Technology_Limited_logo.svg/512px-Nothing_Technology_Limited_logo.svg.png",
  },
  {
    name: "Saregama",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Saregama_Logo.svg/512px-Saregama_Logo.svg.png",
  },
  {
    name: "Lava",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Lava_International_Logo.svg/512px-Lava_International_Logo.svg.png",
  },
  {
    name: "DJI",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/DJI_logo.svg/512px-DJI_logo.svg.png",
  },
  {
    name: "Portronics",
    url: "https://portronics.com/cdn/shop/files/Portronics_Logo_White.png",
  },
  {
    name: "EVM",
    url: "https://evmzone.com/wp-content/uploads/2023/08/EVM-Logo.png",
  },
]

// Generate repeated brand elements for a rich, full 3D sphere
const brandCloudElements = [...brandLogos, ...brandLogos, ...brandLogos].map(
  (brand, index) => (
    <div
      key={`${brand.name}-${index}`}
      className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/95 p-2.5 shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-110"
      title={brand.name}
    >
      <img
        src={brand.url}
        alt={brand.name}
        className="h-full w-full object-contain pointer-events-none"
        loading="lazy"
      />
    </div>
  )
)

export const Landing = () => {
  const { scrollY } = useScroll()

  // Smoothly translate & scale the logo from center to top-left on scroll
  const top = useTransform(scrollY, [0, 250], ["50%", "1.5rem"])
  const left = useTransform(scrollY, [0, 250], ["50%", "1.5rem"])
  const x = useTransform(scrollY, [0, 250], ["-50%", "0%"])
  const y = useTransform(scrollY, [0, 250], ["-50%", "0%"])
  const scale = useTransform(scrollY, [0, 250], [1, 0.65])

  // Fade out hero badge & globe on scroll
  const heroBadgeOpacity = useTransform(scrollY, [0, 100], [1, 0])
  const globeOpacity = useTransform(scrollY, [0, 300], [1, 0.2])

  return (
    <div className="relative min-h-[220vh] w-full bg-background text-foreground overflow-x-hidden">
      {/* ================= FIXED FLOATING LOGO (V + ianet) ================= */}
      <motion.div
        style={{ top, left, x, y, scale }}
        className="fixed z-50 flex origin-top-left items-center tracking-tight pointer-events-auto"
      >
        <img
          src={logo}
          alt="V"
          className="h-10 w-auto object-contain md:h-20"
        />
        <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-5xl font-extrabold leading-none text-transparent md:text-8xl">
          ianet
        </span>
      </motion.div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden border-b">
        {/* Top Trust Statement Badge */}
        <motion.div
          style={{ opacity: heroBadgeOpacity }}
          className="absolute top-[32%] md:top-[30%] z-20 flex items-center justify-center px-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-300 backdrop-blur-md shadow-sm md:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            India&apos;s Largest &amp; Most Trusted Tech Distributor
          </div>
        </motion.div>

        {/* Globe Background */}
        <motion.div
          style={{ opacity: globeOpacity }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <Globe className="top-28 z-10" />
        </motion.div>

        {/* Radial Glow Overlay */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_200%,rgba(153,116,255,0.35),rgba(24,77,253,0.15))]" />

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 z-20 flex flex-col items-center gap-2 text-sm text-muted-foreground animate-bounce">
          <span>Scroll down</span>
          <span>↓</span>
        </div>
      </section>

      {/* ================= DISTRIBUTED BRANDS & ICON CLOUD SECTION ================= */}
      <section className="relative z-20 mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-4">
          AUTHORIZED NATIONAL PARTNER
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Authorized Distribution Network
        </h2>

        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          Official supply chain partner for the world&apos;s most recognized consumer electronics, audio, and smart tech brands across India.
        </p>

        {/* 3D Interactive Brand Sphere */}
        <div className="relative mt-8 flex size-full max-w-xl items-center justify-center overflow-hidden rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-md shadow-2xl">
          <IconCloud icons={brandCloudElements} />
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card/40 p-6 text-left backdrop-blur-sm shadow-sm">
            <h3 className="text-xl font-semibold">⚡ Pan-India Logistics</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Direct express warehousing and fulfillment across all tier-1 and tier-2 states.
            </p>
          </div>

          <div className="rounded-2xl border bg-card/40 p-6 text-left backdrop-blur-sm shadow-sm">
            <h3 className="text-xl font-semibold">🔒 100% Genuine Warranty</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Direct brand-backed serialized warranty and national service assistance.
            </p>
          </div>

          <div className="rounded-2xl border bg-card/40 p-6 text-left backdrop-blur-sm shadow-sm">
            <h3 className="text-xl font-semibold">🏢 Enterprise B2B Supply</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tailored bulk enterprise pricing, inventory credit lines, and rapid dispatch.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Vianet. All rights reserved. India&apos;s Most Trusted Technology Distributor.</p>
      </footer>
    </div>
  )
}