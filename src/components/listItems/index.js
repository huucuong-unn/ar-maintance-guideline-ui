import DashboardIcon from '@mui/icons-material/Dashboard';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Book, Bot, Building, CreditCard, Mail, Users, AppWindowMac } from 'lucide-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export const MainListItems = () => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    };

    const role = 'company';

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
            {role === 'company' &&
                companyRoutes.map((route, index) => (
                    <ListItemButton key={index} onClick={() => handleNavigate(route.route)}>
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.title} />
                    </ListItemButton>
                ))}

            {role === 'admin' &&
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
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    };

    const role = 'company';

    const companyRoutes = [
        {
            route: '/company/dashboard',
            icon: <DashboardIcon />,
            title: 'Dashboard',
        },
        {
            route: '/company/course-management',
            icon: <Book />,
            title: 'Guidelines',
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
            route: '/company/payment-subscription-management',
            icon: <CreditCard />,
            title: 'Payment',
        },
    ];

    const adminRoutes = [
        {
            route: '/admin/dashboard',
            icon: <DashboardIcon />,
            title: 'Dashboard',
        },
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
    ];

    return (
        <React.Fragment>
            {role === 'company' &&
                companyRoutes.map((route, index) => (
                    <ListItemButton key={index} onClick={() => handleNavigate(route.route)}>
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.title} />
                    </ListItemButton>
                ))}

            {role === 'admin' &&
                adminRoutes.map((route, index) => (
                    <ListItemButton key={index} onClick={() => handleNavigate(route.route)}>
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.title} />
                    </ListItemButton>
                ))}
        </React.Fragment>
    );
};
