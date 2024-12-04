import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';



// render - sample page
const HomePage = Loadable(lazy(() => import('pages/home/home')));
const ProfilePage = Loadable(lazy(() => import('pages/profile/Profile')));
const EditProfilePage = Loadable(lazy(() => import('pages/editProfile/EditProfile')));
const AboutPage = Loadable(lazy(() => import('pages/staticPages/about')));
const AlbumAddPage = Loadable(lazy(() => import('pages/home/albumAdd')));
const AlbumShowPage = Loadable(lazy(() => import('pages/home/albumShow')));
const AlbumEditPage = Loadable(lazy(() => import('pages/home/albumEdit')));
const PhotoEditPage = Loadable(lazy(() => import('pages/home/photoEdit')));
const AlbumUploadPage = Loadable(lazy(() => import('pages/home/albumUpload')));



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
      path: '/album/add',
      element: <AlbumAddPage />
    },
    {
      path: '/about',
      element: <AboutPage />
    },
    {
      path: '/album/show',
      element: <AlbumShowPage />
    },
    {
      path: '/album/edit',
      element: <AlbumEditPage />
    },
    {
      path: '/album/upload',
      element: <AlbumUploadPage />
    },
    {
      path: '/photo/edit',
      element: <PhotoEditPage />
    },
   
  ]
};

export default MainRoutes;
