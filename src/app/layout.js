import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }) {
  const loggedIn = true; // TO DO: set up authentication

  return (
    <html lang="en">
      <head>
        <title>MiniFy</title>
      </head>
      <body className={poppins.className}>
      {
        loggedIn ? (
          <>
            {children}
          </>
        ) : (
          <>
            <LoginPage />
          </>
        )
      }
      </body>
    </html>
  );
}

// Mock LoginPage component
function LoginPage({ onLogin }) {
  return (
    <body>
      <div>
        <p>Please log in to continue.</p>
        <button onClick={onLogin}>Log In</button>
      </div>
    </body>
  );
}
