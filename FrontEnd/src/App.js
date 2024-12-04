// project import
import Routes from 'routes';
import ThemeCustomization from 'themes';
import ScrollTop from 'components/ScrollTop';
import { useContext } from 'react';
import { DarkModeContext } from './components/context/darkModeContext';
import Navbar from './components/navbar/Navbar';
import { useLocation } from 'react-router-dom';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const App = () => {
  const { darkMode } = useContext(DarkModeContext);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  return (
    <div className={darkMode ? "app dark" : "app"}>
      <ThemeCustomization>
        <div style={{ paddingTop: isLoginPage ? '0' : '64px', position: 'relative' }}>
          {!isLoginPage && <Navbar />}
          <ScrollTop>
            <Routes />
          </ScrollTop>
        </div>
      </ThemeCustomization>
    </div>
  );
};

export default App;
