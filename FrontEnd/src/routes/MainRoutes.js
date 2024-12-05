import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';



// render - sample page
const HomePage = Loadable(lazy(() => import('pages/home/home')));
const ProfilePage = Loadable(lazy(() => import('pages/profile/Profile')));
const EditProfilePage = Loadable(lazy(() => import('pages/editProfile/EditProfile')));
const AboutPage = Loadable(lazy(() => import('pages/staticPages/about')));
const PhotoEditPage = Loadable(lazy(() => import('pages/home/photoEdit')));




// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/profile/:userId',
      element: <ProfilePage />
    },
    {
      path: '/profile/edit',
      element: <EditProfilePage />
    },
    {
      path: '/about',
      element: <AboutPage />
    },
    {
      path: '/photo/edit',
      element: <PhotoEditPage />
    },
   
  ]
};

export default MainRoutes;
