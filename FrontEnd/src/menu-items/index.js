// Import Sidebar
import Sidebar from "components/sidebar/Sidebar";

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    {
      id: 'sidebar-group',
      type: 'group',
      children: [
        {
          id: 'sidebar-item',
          type: 'sidebar',  // Kiểu sidebar
          component: <Sidebar />,  // Component Sidebar
        },
      ],
    },
  ],
};

export default menuItems;
