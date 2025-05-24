"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [ strength, setStrength ] = useState(0);
  const [ feedback, setFeedback ] = useState("");

  useEffect(() => {
    const calculateStrength = (pwd: string) => {
      if (!pwd) {
        setStrength(0);
        setFeedback("");
        return;
      }

      let score = 0;

      // Length check
      if (pwd.length >= 8) score += 20;
      if (pwd.length >= 12) score += 10;

      // Complexity checks
      if (/[A-Z]/.test(pwd)) score += 15;
      if (/[a-z]/.test(pwd)) score += 15;
      if (/[0-9]/.test(pwd)) score += 15;
      if (/[^A-Za-z0-9]/.test(pwd)) score += 25;

      // Deduct for repeating characters
      if (/(.)\1{2,}/.test(pwd)) score -= 10;

      // Ensure score is between 0-100
      score = Math.max(0, Math.min(100, score));

      setStrength(score);

      // Set feedback based on score
      if (score <= 20) {
        setFeedback("Very weak");
      } else if (score <= 40) {
        setFeedback("Weak");
      } else if (score <= 60) {
        setFeedback("Moderate");
      } else if (score <= 80) {
        setFeedback("Strong");
      } else {
        setFeedback("Very strong");
      }
    };

    calculateStrength(password);
  }, [ password ]);

  const getStrengthColor = () => {
    if (strength <= 20) return "bg-red-500";
    if (strength <= 40) return "bg-orange-500";
    if (strength <= 60) return "bg-yellow-500";
    if (strength <= 80) return "bg-green-500";
    return "bg-emerald-500";
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1 text-xs">
        <span>Password strength</span>
        <span className={
          strength <= 20 ? "text-red-500" :
            strength <= 40 ? "text-orange-500" :
              strength <= 60 ? "text-yellow-500" :
                strength <= 80 ? "text-green-500" :
                  "text-emerald-500"
        }>{feedback}</span>
      </div>
      <Progress
        value={strength}
        className={cn("h-1", {
          "bg-secondary [&>div]:bg-red-500": strength <= 20,
          "bg-secondary [&>div]:bg-orange-500": strength > 20 && strength <= 40,
          "bg-secondary [&>div]:bg-yellow-500": strength > 40 && strength <= 60,
          "bg-secondary [&>div]:bg-green-500": strength > 60 && strength <= 80,
          "bg-secondary [&>div]:bg-emerald-500": strength > 80,
        })}
      />
    </div>
  );
}