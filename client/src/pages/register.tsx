import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Handshake, Star, Users, TrendingUp, Shield, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Register() {
  const handleRegister = () => {
    window.location.href = "/api/login";
  };

  const benefits = [
    {
      icon: Users,
      title: "Connect with Professionals",
      description: "Join a community of skilled professionals ready to share knowledge"
    },
    {
      icon: TrendingUp,
      title: "Grow Your Skills",
      description: "Learn new skills while teaching others what you know best"
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description: "Gain ratings and reviews to showcase your expertise"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Safe and verified environment for professional skill exchange"
    }
  ];

  const features = [
    "Create detailed skill profiles",
    "Browse thousands of available skills",
    "Send and receive swap requests",
    "Schedule learning sessions",
    "Rate and review experiences",
    "Track your learning progress"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-odoo-purple/10 via-white to-odoo-teal/10 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-odoo-purple rounded-lg flex items-center justify-center">
                <Handshake className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold text-odoo-dark">SkillSwap</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-odoo-purple transition-colors">
                Home
              </Link>
              <Link href="/signin" className="text-gray-600 hover:text-odoo-purple transition-colors">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-odoo-purple/10 text-odoo-purple border-odoo-purple/20">
              Join the Community
            </Badge>
            <h1 className="text-4xl font-bold text-odoo-dark mb-4">
              Start Your Skill Exchange Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with professionals, learn new skills, and share your expertise in a secure environment designed for growth.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Registration Card */}
            <div>
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-odoo-purple rounded-full flex items-center justify-center mx-auto mb-4">
                    <Handshake className="text-white text-2xl" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-odoo-dark">
                    Create Your Account
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Join thousands of professionals already exchanging skills
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-odoo-dark">What you'll get:</h3>
                    <ul className="space-y-3">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={handleRegister}
                    className="w-full bg-odoo-purple hover:bg-odoo-purple/90 text-white font-medium py-3"
                    size="lg"
                  >
                    Get Started - It's Free
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="text-center">
                  <p className="text-sm text-gray-600 w-full">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-odoo-purple hover:underline font-medium">
                      Sign in here
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </div>

            {/* Benefits Section */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-odoo-dark mb-6">
                  Why Choose SkillSwap?
                </h2>
                <div className="grid gap-6">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100">
                        <div className="w-12 h-12 bg-odoo-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-odoo-purple" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-odoo-dark mb-2">{benefit.title}</h3>
                          <p className="text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center p-6 bg-odoo-teal/10 rounded-lg">
                <h3 className="font-semibold text-odoo-dark mb-2">Ready in 2 Minutes</h3>
                <p className="text-gray-600">
                  Quick setup process gets you connected with professionals immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © 2024 SkillSwap. Professional skill exchange platform.
          </p>
        </div>
      </footer>
    </div>
  );
}