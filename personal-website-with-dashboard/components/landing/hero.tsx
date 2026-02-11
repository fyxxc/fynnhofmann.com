import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pt-16">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-background/85" />
      </div>
      <div className="mx-auto max-w-3xl text-center">
        <p className="animate-fade-in mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Digital Identity Hub
        </p>
        <h1 className="animate-fade-in text-balance text-4xl font-bold leading-tight tracking-tight text-foreground opacity-0 [animation-delay:100ms] md:text-6xl md:leading-tight">
          Building systems.
          <br />
          <span className="text-accent">Not just websites.</span>
        </h1>
        <p className="animate-fade-in mx-auto mt-8 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground opacity-0 [animation-delay:200ms]">
          Engineer, creator, thinker. I design and build digital infrastructure
          that solves real problems and scales with intent.
        </p>
        <div className="animate-fade-in mt-10 flex items-center justify-center gap-4 opacity-0 [animation-delay:300ms]">
          <Link
            href="/auth/login"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:gap-3 hover:shadow-lg hover:shadow-accent/20"
          >
            Enter Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#about"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  )
}
