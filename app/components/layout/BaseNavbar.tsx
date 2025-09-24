"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// ShadCn
import { Card } from "@/components/ui/card";

// Components
import { DevDebug, LanguageSelector, ThemeSwitcher } from "@/app/components";

const BaseNavbar = () => {
  const devEnv = useMemo(() => process.env.NODE_ENV === "development", []);

  return (
    <header className="lg:container z-[99]">
      <nav>
        <Card className="flex flex-wrap justify-between items-center px-5 py-3 gap-5 shadow-sm">
          {/* Logo Section */}
          <Link href={"/"} className="flex items-center gap-2">
            {/* Option 1: Text Logo */}
            <span className="text-2xl font-bold text-primary">Quick</span>
            <span className="text-2xl font-bold text-gray-700">Accounting</span>

            {/* Option 2: Dummy Image Logo (uncomment to use) */}
            {/* 
            <Image
              src="https://via.placeholder.com/150x50.png?text=QuickAccounting"
              alt="QuickAccounting Logo"
              width={150}
              height={50}
              className="object-contain"
            />
            */}
          </Link>

          {/* Dev Debug Only */}
          {devEnv && <DevDebug />}

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <ThemeSwitcher />
          </div>
        </Card>
      </nav>
    </header>
  );
};

export default BaseNavbar;
