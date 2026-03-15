import { Outlet } from 'react-router-dom';
import SupplierSidebar from '../../components/SupplierSidebar';

const SupplierLayout = () => {
  return (
    <div className="flex h-screen bg-blue-50">
      <SupplierSidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default SupplierLayout;
