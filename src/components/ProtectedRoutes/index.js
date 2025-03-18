import { Outlet } from 'react-router-dom';
import storageService from '../StorageService/storageService';

const ProtectedRoutes = ({ roleName }) => {
    const user = storageService.getItem('userInfo')?.user || null;
    if (user !== null) {
        switch (roleName) {
            case 'ADMIN':
                return user?.role?.roleName === 'ADMIN' ? <Outlet /> : (window.location.href = '/not-authorized');
            case 'COMPANY':
                return user?.role?.roleName === 'COMPANY' ? <Outlet /> : (window.location.href = '/not-authorized');
            case 'DESIGNER':
                return user?.role?.roleName === 'DESIGNER' ? <Outlet /> : (window.location.href = '/not-authorized');
            case 'MANAGER':
                return user?.role?.roleName === 'MANAGER' ? <Outlet /> : (window.location.href = '/not-authorized');
        }
    } else {
        window.location.href = '/not-authorized';
    }
};
export default ProtectedRoutes;
