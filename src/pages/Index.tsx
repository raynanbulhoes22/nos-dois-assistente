import { useAuth } from "@/hooks/useAuth";
import { LandingPage } from "@/components/LandingPage";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <img 
            src="/lovable-uploads/5851c6be-e288-4d05-ba44-16bf3ad53566.png" 
            alt="Lyvo Logo" 
            className="h-12 w-12 mx-auto mb-4 animate-pulse object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              console.warn('Logo failed to load');
            }}
          />
          <h1 className="text-2xl font-bold mb-2">Lyvo | LucraAI</h1>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <Dashboard user={user} />;
};

export default Index;
