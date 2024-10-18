"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    const redirectUrl = localStorage.getItem("loginRedirectUrl");
    if (redirectUrl) {
      localStorage.removeItem("loginRedirectUrl");
      router.push(redirectUrl);
    } else {
      router.push("/");
    }
  }, [router]);

  return null; // This component doesn't render anything
};

export default Callback;
