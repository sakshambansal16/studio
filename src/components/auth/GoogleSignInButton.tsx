
'use client';

import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect } from 'react';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 256S109.8 0 244 0c73 0 135.7 29.1 182.2 75.3l-63.5 61.8C333.6 112.5 292.5 95.3 244 95.3c-83.8 0-152.3 68.3-152.3 160.7s68.5 160.7 152.3 160.7c98.2 0 130.3-73.3 134-110.4H244V261.8h244z"></path>
  </svg>
);


export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Handle redirect result on component mount
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        if (result) {
          // User signed in. Redirect is handled by AuthProvider.
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Google Sign-In Failed",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    handleRedirect();
  }, [toast]);

  const handleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      if (isMobile) {
        // Redirect is better for mobile environments
        await signInWithRedirect(auth, provider);
      } else {
        // Popup is better for desktop
        await signInWithPopup(auth, provider);
        // Redirect handled by AuthProvider
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message,
      });
      setLoading(false);
    } 
    // Don't setLoading(false) here for redirect flow, as the page will reload.
  };

  return (
    <Button variant="outline" type="button" className="w-full" disabled={loading} onClick={handleSignIn}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
      Continue with Google
    </Button>
  );
}
