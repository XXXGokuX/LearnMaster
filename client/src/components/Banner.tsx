import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const bannerItems = [
  {
    title: "Start Your Learning Journey Today",
    description: "Explore thousands of courses from expert instructors",
    image: "/images/banner1.svg",
  },
  {
    title: "Learn at Your Own Pace",
    description: "Access course content anytime, anywhere",
    image: "/images/banner2.svg",
  },
  {
    title: "Boost Your Career",
    description: "Gain in-demand skills for the modern workplace",
    image: "/images/banner3.svg",
  },
];

export function Banner() {
  return (
    <div className="pt-16 bg-gradient-to-r from-primary/5 to-primary/10">
      <Carousel className="w-full max-w-6xl mx-auto">
        <CarouselContent>
          {bannerItems.map((item, index) => (
            <CarouselItem key={index}>
              <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
                <div className="flex-1 space-y-4">
                  <h2 className="text-4xl font-bold tracking-tight">{item.title}</h2>
                  <p className="text-lg text-muted-foreground">{item.description}</p>
                  <Button size="lg">Get Started</Button>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-full max-w-md aspect-video bg-primary/5 rounded-lg" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
