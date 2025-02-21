import { SiMeta, SiGooglecloud, SiAmazon, SiWindows, SiOracle, SiCisco } from "react-icons/si";

export function Partners() {
  const partners = [
    { icon: SiMeta, name: "Meta" },
    { icon: SiGooglecloud, name: "Google Cloud" },
    { icon: SiAmazon, name: "AWS" },
    { icon: SiWindows, name: "Microsoft" },
    { icon: SiOracle, name: "Oracle" },
    { icon: SiCisco, name: "Cisco" },
  ];

  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Partners</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {partners.map((Partner, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center space-y-2"
            >
              <Partner.icon className="w-12 h-12 text-gray-600" />
              <span className="text-sm text-muted-foreground">{Partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}