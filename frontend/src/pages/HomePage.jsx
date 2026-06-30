import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import Sectors from "../components/Sectors";
import Partners from "../components/Partners";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Sectors />
      <Partners />
      <Contact />
      <Footer />
    </div>
  );
}
