import { Nav } from "@/components/landing/nav"
import { Hero } from "@/components/landing/hero"
import { About } from "@/components/landing/about"
import { Projects } from "@/components/landing/projects"
import { Footer } from "@/components/landing/footer"

export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Projects />
      <Footer />
    </main>
  )
}
