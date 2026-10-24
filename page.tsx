import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import { Specs, MacroBand, Craft, Reserve, Footer } from "@/components/Sections";

export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <Specs />
      <MacroBand />
      <Craft />
      <Reserve />
      <Footer />
    </main>
  );
}
