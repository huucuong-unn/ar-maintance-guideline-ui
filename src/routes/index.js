import AdminLayout from '~/components/Layouts/AdminLayout';
import ForgotPassword from '~/pages/new/ForgotPassword';

//new
import FullLayout from '~/components/Layouts/FullLayout';
import AccountsManagement from '~/pages/new/AccountsManagement';
import BlogsManagement from '~/pages/new/BlogsManagement';
import DashboardManagement from '~/pages/new/DashboardManagement';
import Homepage from '~/pages/new/Homepage';
import LoginAdmin from '~/pages/new/LoginAdmin';
import LoginBusiness from '~/pages/new/LoginBusiness';
import LoginUser from '~/pages/new/LoginUser';
import PaymentFailed from '~/pages/new/PaymentFailed';
import PaymentsManagement from '~/pages/new/PaymentsManagement';
import PaymentSuccess from '~/pages/new/PaymentSuccess';
import RegisterUser from '~/pages/new/RegisterUser';
import ResetPassword from '~/pages/new/ResetPassword';
import TestPage from '~/pages/new/TestPage';
import UserProfile from '~/pages/new/UserProfile';
import NotAuthorized from '~/pages/NotAuthorized';
import FooterHome from '~/parts/FooterHome';
import Header from '~/parts/Header';
import MyLearning from '~/pages/new/MyLearning';
import AdminTestPage from '~/pages/new/BaseAdmin';

const publicRoutes = [
    //new
    { path: '/login', component: LoginUser, layout: null },
    { path: '/admin/login', component: LoginAdmin, layout: null },
    { path: '/business/login', component: LoginBusiness, layout: null },
    { path: '/register', component: RegisterUser, layout: null },
    { path: '/forgot-password', component: ForgotPassword, layout: null },
    { path: '/reset-password', component: ResetPassword, layout: null },
    { path: '/home', component: Homepage, layout: FullLayout },
    { path: '/', component: Homepage, layout: FullLayout },
    { path: '/payment/success', component: PaymentSuccess, layout: null },
    { path: '/payment/failed', component: PaymentFailed, layout: null },
    { path: '/profile/:userId', component: UserProfile, layout: FullLayout },
    { path: '/my-learning', component: MyLearning, layout: FullLayout },

    { path: '/NotAuthorized', component: NotAuthorized, layout: null },

    { path: '/test/footer', component: FooterHome, layout: null },
    { path: '/test/header', component: Header, layout: null },
    { path: '/test/test-page', component: TestPage, layout: null },
    { path: '/test/admin-test', component: AdminTestPage, layout: null },
];

const adminRoutes = [
    { path: '/admin/blog-management', component: BlogsManagement, layout: AdminLayout },
    { path: '/admin/account-management', component: AccountsManagement, layout: AdminLayout },
    { path: '/admin/payment-management', component: PaymentsManagement, layout: AdminLayout },
    { path: '/admin/dashboard', component: DashboardManagement, layout: AdminLayout },
];

const privateRoutes = [];

export { adminRoutes, privateRoutes, publicRoutes };
