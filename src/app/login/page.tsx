"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Ensure profile exists in profiles table
        if (data.user) {
          const { data: profile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();

          if (!profile && !profileCheckError) {
            const businessName = data.user.user_metadata?.business_name || email.split('@')[0] || 'Valued Customer';
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                business_name: businessName,
                role: 'customer'
              });
          }
        }

        toast.success('Logged in successfully!');
        router.push('/');
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              business_name: businessName || email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        
        // If sign up successful, insert profile if user is returned (might fail if email confirmation is required and user is not authenticated yet)
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              business_name: businessName || email.split('@')[0],
              role: 'customer'
            });
            
          if (profileError) {
            console.error('Profile creation error during sign-up:', profileError);
          }
        }
        
        toast.success('Account created! Please check your email to verify.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="text-gray-500 mt-2">
          {isLogin 
            ? 'Sign in to place wholesale orders' 
            : 'Register your business for wholesale access'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              required={!isLogin}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="e.g. Fresh Foods Market"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : isLogin ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
        >
          {isLogin ? 'Sign Up' : 'Log In'}
        </button>
      </div>
    </div>
  );
}
