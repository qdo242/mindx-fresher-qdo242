import { useEffect, useState, useCallback } from 'react';
import ReactGA from 'react-ga4';
import './App.css';

ReactGA.initialize("G-NNES1RXLX3")

interface UserInfo {
  email: string;
  name: string;
}

function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  
  const checkUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data: UserInfo = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
    ReactGA.send({ hitType: "pageview", page: window.location.pathname});
  }, [checkUser]);

  const handleLogin = () => {
    ReactGA.event({
      category: "Auth",
      action: "Login_Button_Clicked",
    });

    window.location.href = '/api/auth/login'
  };
  const handleLogout = () => {
    ReactGA.event({
      category:"Auth",
      action:"Logout_Button_Clicked",
    });
    window.location.href = '/api/auth/logout'

  };

  if (loading) return <div className="App-loading">Đang tải...</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>MindX Onboarding</h1>
        {user ? (
          <div className="user-card">
            <p>Chào mừng, <strong>{user.name}</strong>!</p>
            {/* <p className="email-info">Định danh: <code>{user.email}</code></p> */}
            <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
          </div>
        ) : (
          <div className="login-box">
            <p>Vui lòng đăng nhập để tiếp tục</p>
            <button className="login-btn" onClick={handleLogin}>Đăng nhập</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;