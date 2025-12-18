import React from "react";
import { Link } from "wouter";
import chesapeakeLogo from "@/assets/chesapeake-bank-logo.png";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-12" }: LogoProps) {
  return (
    <div className="flex items-center">
      <Link to="/">
        <img 
          src={chesapeakeLogo} 
          alt="Chesapeake Bank" 
          className={`${className} cursor-pointer hover:opacity-90 transition-opacity`}
          style={{ 
            maxWidth: '160px',
            objectFit: 'contain'
          }} 
        />
      </Link>
    </div>
  );
}
