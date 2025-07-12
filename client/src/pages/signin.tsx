import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, Users, Shield, Zap } from "lucide-react";
import { Link } from "wouter";

export default function SignIn() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

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
              <Link href="/about" className="text-gray-600 hover:text-odoo-purple transition-colors">
                About
              </Link>
              <Link href="/features" className="text-gray-600 hover:text-odoo-purple transition-colors">
                Features
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="w-16 h-16 bg-odoo-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="text-white text-2xl" />
              </div>
              <CardTitle className="text-2xl font-bold text-odoo-dark">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to continue your skill exchange journey
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-odoo-purple/10">
                  <Users className="w-6 h-6 text-odoo-purple mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Connect</p>
                </div>
                <div className="p-3 rounded-lg bg-odoo-teal/10">
                  <Zap className="w-6 h-6 text-odoo-teal mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Learn</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Secure</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Use your account to access all features
                </p>
                
                <Button 
                  onClick={handleSignIn}
                  className="w-full bg-odoo-purple hover:bg-odoo-purple/90 text-white font-medium py-3"
                  size="lg"
                >
                  Sign In with Your Account
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>

            <CardFooter className="text-center">
              <p className="text-sm text-gray-600 w-full">
                New to SkillSwap?{" "}
                <Link href="/register" className="text-odoo-purple hover:underline font-medium">
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </Card>
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