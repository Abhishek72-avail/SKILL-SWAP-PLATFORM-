import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Handshake, Star, Search } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-odoo-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-odoo-purple rounded-lg flex items-center justify-center">
                <Handshake className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-odoo-dark">SkillSwap</h1>
                <p className="text-sm text-gray-500">Professional Exchange</p>
              </div>
            </div>
            <Button onClick={handleLogin} className="bg-odoo-purple hover:bg-purple-700">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-odoo-dark mb-6">
            Exchange Skills, Expand Horizons
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with professionals, trade your expertise, and learn new skills through our innovative skill-swapping platform.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-odoo-purple hover:bg-purple-700 text-lg px-8 py-4"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-odoo-dark mb-12">
            How SkillSwap Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="text-blue-600 text-2xl" />
                </div>
                <CardTitle>Create Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  List your skills, expertise, and what you'd like to learn. Set your availability and preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="text-green-600 text-2xl" />
                </div>
                <CardTitle>Find Skill Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Browse profiles, search for specific skills, and discover professionals who can help you grow.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Handshake className="text-purple-600 text-2xl" />
                </div>
                <CardTitle>Exchange & Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Send swap requests, agree on terms, and start exchanging knowledge with your skill partners.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-odoo-dark mb-12">
            Why Choose SkillSwap?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-6">
                <li className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="text-green-600 h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-odoo-dark mb-2">Quality Connections</h3>
                    <p className="text-gray-600">Connect with verified professionals and build meaningful learning relationships.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="text-blue-600 h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-odoo-dark mb-2">Flexible Learning</h3>
                    <p className="text-gray-600">Learn at your own pace with scheduling that works for both parties.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="text-purple-600 h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-odoo-dark mb-2">Mutual Growth</h3>
                    <p className="text-gray-600">Both parties benefit from the exchange, creating a win-win learning environment.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <Card className="p-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-odoo-dark">Ready to Start?</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">
                    Join thousands of professionals already exchanging skills and growing their careers.
                  </p>
                  <Button 
                    onClick={handleLogin}
                    className="w-full bg-odoo-purple hover:bg-purple-700"
                    size="lg"
                  >
                    Join SkillSwap Today
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-odoo-dark text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-odoo-purple rounded-lg flex items-center justify-center">
              <Handshake className="text-white text-sm" />
            </div>
            <h3 className="text-xl font-bold">SkillSwap</h3>
          </div>
          <p className="text-gray-300">
            Professional skill exchange platform for career growth and learning.
          </p>
        </div>
      </footer>
    </div>
  );
}
