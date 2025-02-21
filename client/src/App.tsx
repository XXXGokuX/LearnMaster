import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { HomePage } from "@/pages/Home";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminCourses from "@/pages/admin-courses";
import AdminStudents from "@/pages/admin-students";
import CoursePage from "@/pages/course-page";
import MyCourses from "@/pages/my-courses";
import BrowseCourses from "@/pages/browse-courses";
import PrivacyPolicy from "@/pages/policies/privacy-policy";
import TermsAndConditions from "@/pages/policies/terms-and-conditions";
import RefundPolicy from "@/pages/policies/refund-policy";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <ProtectedRoute path="/admin/courses" component={AdminCourses} />
      <ProtectedRoute path="/admin/students" component={AdminStudents} />
      <ProtectedRoute path="/course/:id" component={CoursePage} />
      <ProtectedRoute path="/my-courses" component={MyCourses} />
      <ProtectedRoute path="/browse-courses" component={BrowseCourses} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-and-conditions" component={TermsAndConditions} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;