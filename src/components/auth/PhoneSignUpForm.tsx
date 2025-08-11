
'use client';
import { useState, useEffect } from 'react';
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

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    // This timeout ensures the div is in the DOM.
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          }
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  async function onSendCode(values: z.infer<typeof phoneSchema>) {
    setLoading(true);
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
        throw new Error("reCAPTCHA verifier not initialized.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Send Code",
        description: error.message,
      });
      // Reset reCAPTCHA if it fails
      if(window.recaptchaVerifier && (window as any).grecaptcha) {
        window.recaptchaVerifier.render().then((widgetId) => {
            if (typeof (window as any).grecaptcha !== 'undefined') {
                 (window as any).grecaptcha.reset(widgetId);
            }
        });
      }
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
      <div id="recaptcha-container"></div>
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
