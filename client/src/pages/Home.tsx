import { Navbar } from "@/components/Navbar";
import { Banner } from "@/components/Banner";
import { CourseGrid } from "@/components/CourseGrid";
import { Partners } from "@/components/Partners";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Banner />
        <CourseGrid />
        <Partners />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
