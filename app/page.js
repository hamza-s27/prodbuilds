import Hero from "@/components/Hero";
import Image from "next/image";
import "../styles/section2.css";
import "../styles/section3.css"
import Infocard from "@/components/Infocard";
import "../styles/section4.css";
import Button from "@/components/Button";
import Section2 from "@/sections/section2/Section2";
import SectionResults from "@/sections/sectionR/SectionResults";
import SectionServices from "@/sections/sectionServices/SectionServices";
import Blogsection from "@/sections/7blogsection/Blogsection";

export default function Home() {
  return (
    <main>
      <section>
      <Hero></Hero>
      </section>
       <Section2></Section2>
       <SectionResults></SectionResults>
       <SectionServices></SectionServices>
       <Blogsection></Blogsection>

       
    </main>
  );
}
