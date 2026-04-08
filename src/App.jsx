import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {

  // captura crash global
  window.onerror = function(message, source, line, col, error){

    fetch("/api/bugs/report",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        type:"frontend_crash",
        severity:"critical",
        source:"web",
        message,
        stack: error?.stack,
        meta:{
          source,
          line,
          col
        }
      })
    })

  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}