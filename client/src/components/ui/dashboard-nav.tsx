import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, GraduationCap, LogOut, User } from "lucide-react";

const avatars = [
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  "https://images.unsplash.com/photo-1544724107-6d5c4caaff30",
  "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5"
];

export function DashboardNav() {
  const { user, logoutMutation } = useAuth();
  const avatarUrl = avatars[parseInt(user?.id.toString() ?? "0") % avatars.length];

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <a className="text-2xl font-bold text-primary flex items-center">
              <GraduationCap className="w-8 h-8 mr-2" />
              LMS
            </a>
          </Link>

          <div className="hidden md:flex space-x-4">
            <Link href="/">
              <a className="text-gray-600 hover:text-gray-900 flex items-center">
                <Book className="w-4 h-4 mr-2" />
                Courses
              </a>
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin/courses">
                <a className="text-gray-600 hover:text-gray-900">
                  Manage Courses
                </a>
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt={user?.username} />
                  <AvatarFallback>
                    {user?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>{user?.username}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 flex items-center"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
