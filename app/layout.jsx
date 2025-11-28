import "./globals.css";

export const metadata = {
  title: "MFFS Portal",
  description: "Training, supervision, and onboarding portal for Moving Forward Family Services"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
