import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Developer",
    avatar: "/avatars/sarah.jpg",
    content:
      "The courses here have been instrumental in advancing my career. The quality of instruction is outstanding.",
  },
  {
    name: "Michael Chen",
    role: "UX Designer",
    avatar: "/avatars/michael.jpg",
    content:
      "I've taken several design courses, and each one has helped me improve my skills significantly.",
  },
  {
    name: "Emily Martinez",
    role: "Marketing Manager",
    avatar: "/avatars/emily.jpg",
    content:
      "The platform offers an excellent variety of courses. I particularly enjoyed the practical assignments.",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">What Our Students Say</h2>
      <Carousel className="w-full max-w-4xl mx-auto">
        <CarouselContent>
          {testimonials.map((testimonial, index) => (
            <CarouselItem key={index}>
              <Card className="border-none shadow-none">
                <CardContent className="flex flex-col items-center text-center p-6">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-lg mb-4 italic">{testimonial.content}</p>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
