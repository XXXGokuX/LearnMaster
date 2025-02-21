import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, LogOut, PlusCircle, Users, Book } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed top-0 w-full bg-white border-b z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary">EduLearn</h1>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-6 mx-8">
              {user.role === "admin" ? (
                <>
                  <Link href="/admin/courses">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Manage Courses
                    </Button>
                  </Link>
                  <Link href="/admin/students">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Manage Students
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/my-courses">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      My Courses
                    </Button>
                  </Link>
                  <Link href="/browse-courses">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      Browse Courses
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search courses..."
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.username}
                </span>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    logoutMutation.mutate();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Log in
                </Button>
                <Button onClick={() => navigate("/auth?tab=register")}>
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}