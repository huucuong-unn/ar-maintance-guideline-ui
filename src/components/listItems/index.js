import DashboardIcon from '@mui/icons-material/Dashboard';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
    AppWindowMac,
    Bot,
    Building,
    CreditCard,
    Users,
    Monitor,
    FileType,
    AppWindowMacIcon,
    Mail,
} from 'lucide-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import storageService from '../StorageService/storageService';

export const MainListItems = () => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    };

    const [userInfo, setUserInfo] = React.useState(storageService.getItem('userInfo')?.user || null);
    const role = userInfo?.role?.roleName;

    const companyRoutes = [
        {
            route: '/company/course',
            icon: <AppWindowMac />,
            title: 'My Guidelines',
        },
    ];

    const adminRoutes = [
        {
            route: '/admin/dashboard',
            icon: <DashboardIcon />,
            title: 'Dashboard',
        },
    ];

    return (
        <React.Fragment>
            {role === 'COMPANY' &&
                companyRoutes.map((route, index) => (
                    <ListItemButton key={index} onClick={() => handleNavigate(route.route)}>
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.title} />
                    </ListItemButton>
                ))}

            {role === 'ADMIN' &&
                adminRoutes.map((route, index) => (
                    <ListItemButton key={index} onClick={() => handleNavigate(route.route)}>
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.title} />
                    </ListItemButton>
                ))}
        </React.Fragment>
    );
};

export const SecondaryListItems = () => {
    const [userInfo, setUserInfo] = React.useState(storageService.getItem('userInfo')?.user || null);
    const role = userInfo?.role?.roleName;
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    };

    const companyRoutes = [
        {
            route: '/company/dashboard',
            icon: <DashboardIcon />,
            title: 'Dashboard',
        },
        {
            route: '/company/machines-management',
            icon: <Monitor />,
            title: 'Machines',
        },
        {
            route: '/company/machines-type-management',
            icon: <FileType />,
            title: 'Machine Types',
        },
        {
            route: '/company/model-management',
            icon: <Bot />,
            title: '3D Models',
        },
        {
            route: '/company/account-management',
            icon: <Users />,
            title: 'Employees',
        },
        {
            route: '/company/payment/history',
            icon: <CreditCard />,
            title: 'Payment',
        },
        {
            route: '/company/company-request-management',
            icon: <Mail />,
            title: 'Company Request',
        },
        {
            route: '/wallet/history',
            icon: <AppWindowMac />,
            title: 'Wallet History',
        },
    ];

    const adminRoutes = [
        {
            route: '/admin/company-management',
            icon: <Building />,
            title: 'Companies',
        },
        {
            route: '/admin/account-management',
            icon: <Users />,
            title: 'Accounts',
        },
        {
            route: '/admin/payment-management',
            icon: <CreditCard />,
            title: 'Payments',
        },
        {
            route: '/admin/service-price-management',
            icon: <CreditCard />,
            title: 'Service Price',
        },
    ];

    const designerRoutes = [
        {
            route: '/designer/company-request-management',
            icon: <Mail />,
            title: 'Company Request',
        },
    ];

    return (
        <React.Fragment>
            {role === 'COMPANY' &&
                companyRoutes.map((route, index) => (
                    <ListItemButton key={index} onClick={() => handleNavigate(route.route)}>
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.title} />
                    </ListItemButton>
                ))}
            {role === 'ADMIN' &&
                adminRoutes.map((route, index) => (
                    <ListItemButton key={index} onClick={() => handleNavigate(route.route)}>
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.title} />
                    </ListItemButton>
                ))}{' '}
            {role === 'DESIGNER' &&
                designerRoutes.map((route, index) => (
                    <ListItemButton key={index} onClick={() => handleNavigate(route.route)}>
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.title} />
                    </ListItemButton>
                ))}
        </React.Fragment>
    );
};
