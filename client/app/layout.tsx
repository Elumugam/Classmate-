import "./globals.css";

export const metadata = {
  title: "ClassMates+ | AI Study Assistant",
  description: "Boost your learning with an AI-powered study assistant.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
