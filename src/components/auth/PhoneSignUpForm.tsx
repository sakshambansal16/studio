
'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const phoneSchema = z.object({
  phone: z.string().min(10, { message: "Please enter a valid phone number with country code." }),
});

const codeSchema = z.object({
  code: z.string().min(6, { message: "Verification code must be 6 digits." }),
});

export default function PhoneSignUpForm() {
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { toast } = useToast();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);


  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    // Cleanup any existing verifier
    if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
        window.recaptchaVerifier.clear();
    }
  }, []);

  const setupRecaptcha = () => {
    if (!recaptchaContainerRef.current) return;
    
    // Clear previous instance if it exists
     if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
        window.recaptchaVerifier.clear();
     }
    
     // Ensure the container is empty
     recaptchaContainerRef.current.innerHTML = "";
     const newRecaptchaContainer = document.createElement('div');
     recaptchaContainerRef.current.appendChild(newRecaptchaContainer);

    try {
       window.recaptchaVerifier = new RecaptchaVerifier(auth, newRecaptchaContainer, {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, you can proceed with sign-in.
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          toast({
              variant: "destructive",
              title: "reCAPTCHA Expired",
              description: "Please try sending the code again.",
          });
        }
      });
    } catch(error) {
        console.error("Error creating RecaptchaVerifier", error);
    }
  }

  async function onSendCode(values: z.infer<typeof phoneSchema>) {
    setLoading(true);
    setupRecaptcha(); // Set up recaptcha right before sending code
    
    try {
      const verifier = window.recaptchaVerifier;
      if(verifier){
        const result = await signInWithPhoneNumber(auth, values.phone, verifier);
        setConfirmationResult(result);
        toast({
          title: "Verification Code Sent",
          description: `A code has been sent to ${values.phone}.`,
        });
      } else {
        throw new Error("reCAPTCHA verifier not initialized. Please try again.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Send Code",
        description: error.message,
      });
      console.error("Phone auth error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyCode(values: z.infer<typeof codeSchema>) {
    if (!confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(values.code);
      // Redirect will be handled by AuthProvider
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "The code you entered is invalid. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div ref={recaptchaContainerRef}></div>
      {!confirmationResult ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onSendCode)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 123 456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...codeForm}>
          <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-4">
            <FormField
              control={codeForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify and Sign Up
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}

// Add this to your global types or in a separate .d.ts file
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}
