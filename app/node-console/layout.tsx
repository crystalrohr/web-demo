export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex w-full flex-col items-center gap-8 pt-8 h-screen dark:bg-dot-white/[0.2] bg-dot-black/[0.2] overflow-scroll">
      <div className="fixed pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <img className="dark:hidden" src="/logo-vertical.svg" alt="logo" />
      <img
        className="hidden dark:block"
        src="/logo-vertical-dark.svg"
        alt="logo"
      />
      <div className="relative z-10 flex flex-col items-center gap-8 flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
