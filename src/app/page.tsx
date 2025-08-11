
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bot, Baby, GraduationCap, User, Palette, LogIn, UserPlus, LogOut } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const THEMES = ['dark', 'jungle', 'ocean', 'space'];

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [playerChoice, setPlayerChoice] = useState('X');
  const { user, loading } = useAuth();

  useEffect(() => {
    const html = document.documentElement;
    const storedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(storedTheme);
    html.classList.remove('dark', 'theme-jungle', 'theme-ocean', 'theme-space');
    if (storedTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.add(`theme-${storedTheme}`);
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    const html = document.documentElement;
    html.classList.remove('dark', 'theme-jungle', 'theme-ocean', 'theme-space');
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.add(`theme-${newTheme}`);
    }
  }

  const handleLogout = async () => {
    await auth.signOut();
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 relative">

      <div className="absolute top-4 right-4">
        {loading ? (
          <Skeleton className="h-10 w-24" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName ?? 'Welcome'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/auth" passHref>
            <Button><LogIn className="mr-2" />Login</Button>
          </Link>
        )}
      </div>

      <div className="text-center mb-8 sm:mb-12">
        <h1 className={cn("font-headline text-5xl sm:text-7xl font-bold tracking-tight", theme === 'dark' ? 'text-primary' : 'text-primary-foreground')}>
          Tic Tac Toe
        </h1>
        <p className="text-muted-foreground mt-2 text-lg sm:text-xl">A vibrant and playful game for all ages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl w-full">
        <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Bot className="w-10 h-10 text-accent" />
              <div>
                <CardTitle className="font-headline text-2xl">Single Player</CardTitle>
                <CardDescription>Challenge our adaptive AI</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className='space-y-2'>
              <Label>Choose your side</Label>
              <RadioGroup defaultValue="X" value={playerChoice} onValueChange={setPlayerChoice} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="X" id="player-x" />
                  <Label htmlFor="player-x">Player X (Starts)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="O" id="player-o" />
                  <Label htmlFor="player-o">Player O</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex flex-col gap-3">
              <Link href={`/game?mode=single&age=Child&theme=${theme}&player=${playerChoice}`} passHref>
                <Button className="w-full justify-start" variant="outline"><Baby className="mr-2 h-5 w-5" /> Child Mode</Button>
              </Link>
              <Link href={`/game?mode=single&age=Teen&theme=${theme}&player=${playerChoice}`} passHref>
                <Button className="w-full justify-start" variant="outline"><GraduationCap className="mr-2 h-5 w-5" /> Teen Mode</Button>
              </Link>
              <Link href={`/game?mode=single&age=Adult&theme=${theme}&player=${playerChoice}`} passHref>
                <Button className="w-full justify-start" variant="outline"><User className="mr-2 h-5 w-5" /> Adult Mode</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-accent" />
              <div>
                <CardTitle className="font-headline text-2xl">Local Multiplayer</CardTitle>
                <CardDescription>Play against a friend</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center">
            <Link href={`/game?mode=local&theme=${theme}`} passHref>
              <Button className="w-full text-lg" size="lg"><Users className="mr-2 h-6 w-6" /> Start Game</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full max-w-4xl mt-8 shadow-lg bg-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Palette className="w-8 h-8 text-accent" />
            <div>
              <CardTitle className="font-headline text-2xl">Theme Selector</CardTitle>
              <CardDescription>Choose a fun theme for your game!</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="jungle">Jungle</SelectItem>
              <SelectItem value="ocean">Ocean</SelectItem>
              <SelectItem value="space">Space</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </main>
  );
}
