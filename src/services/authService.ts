import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export const authService = {
  async signUp(email: string, password: string, fullName: string, companyData: any) {
    // 1. Sign up user (this automatically fires the Supabase trigger to create the company and profile)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyData.name
        }
      }
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // 2. Wait for the trigger to finish, then fetch the auto-created profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile?.company_id) {
      console.warn("Profile/Company trigger hasn't completed yet, or failed.", profileError);
      return authData; // The dashboard can still load, they'll just have a blank company
    }

    // 3. Update the newly created company with the rest of the form data
    const { error: updateError } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', profile.company_id);

    if (updateError) {
      console.error('Failed to update company with extra details:', updateError);
    }

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription;
  }
};
