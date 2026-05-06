import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { LogIn, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase credentials are not configured. Please check your setup.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-secondary/50 backdrop-blur-xl p-8 rounded-[40px] border border-white/5"
      >
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
             <Crown className="w-8 h-8 text-primary" />
           </div>
           

        </div>

        <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
          <div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-black/40 border border-white/5 rounded-full px-6 py-4 outline-none focus:border-primary/50 transition-all text-sm"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access Key"
              className="w-full bg-black/40 border border-white/5 rounded-full px-6 py-4 outline-none focus:border-primary/50 transition-all text-sm"
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-red-500 text-[10px] text-center uppercase tracking-wider">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-black font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : <><LogIn className="w-4 h-4" /> Sign In</>}
          </button>
        </form>


      </motion.div>
    </div>
  );
};

export default AdminLogin;
