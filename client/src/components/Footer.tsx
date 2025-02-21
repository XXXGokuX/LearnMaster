import { Link } from "wouter";

export function Footer() {
  const footerLinks = {
    "About Us": ["Our Story", "Team", "Careers", "Press"],
    "For Students": ["How it Works", "FAQ", "Support", "Resources"],
    "For Instructors": ["Become an Instructor", "Teaching Center", "Guidelines"],
    "Legal": ["Terms of Service", "Privacy Policy", "Cookie Policy"],
  };

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
          <p>&copy; 2025 EduLearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
