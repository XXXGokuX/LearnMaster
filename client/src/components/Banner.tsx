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
    image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200&auto=format&fit=crop&q=80",
  },
  {
    title: "Learn at Your Own Pace",
    description: "Access course content anytime, anywhere",
    image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&auto=format&fit=crop&q=80",
  },
  {
    title: "Boost Your Career",
    description: "Gain in-demand skills for the modern workplace",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80",
  },
];

export function Banner() {
  return (
    <div className="pt-16">
      <Carousel className="w-full">
        <CarouselContent>
          {bannerItems.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[500px] w-full overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <div className="absolute inset-0 bg-black/50" />
                </div>
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl text-white">
                      <h2 className="text-5xl font-bold mb-4">{item.title}</h2>
                      <p className="text-xl mb-8">{item.description}</p>
                      <Button size="lg" className="bg-primary hover:bg-primary/90">
                        Get Started
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
}