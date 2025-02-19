import AdminLayout from '~/components/Layouts/AdminLayout';
import ForgotPassword from '~/pages/new/ForgotPassword';

//new
import FullLayout from '~/components/Layouts/FullLayout';
import AdminTestPage from '~/pages/new/BaseAdmin';
import BlogsManagement from '~/pages/new/BlogsManagement';
import Course from '~/pages/new/Course';
import CourseLearning from '~/pages/new/CourseLearning';
import DashboardManagement from '~/pages/new/DashboardManagement';
import Homepage from '~/pages/new/Homepage';
import LoginAdmin from '~/pages/new/LoginAdmin';
import LoginBusiness from '~/pages/new/LoginBusiness';
import LoginUser from '~/pages/new/LoginUser';
import MyLearning from '~/pages/new/MyLearning';
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
import CoursesManagement from '~/pages/new/CoursesManagement';
import ModelsManagement from '~/pages/new/ModelsManagement';
import ModelRequestManagement from '~/pages/new/ModelRequestManagement';
import PaymentAndSubscriptionManagement from '~/pages/new/PaymentAndSubscriptionManagement';
import EmployeesManagement from '~/pages/new/EmployeesManagement';
import CompaniesManagement from '~/pages/new/CompaniesManagement';
// import AccountsManagement from '~/pages/new/AccountsManagement ';
import CoursesControl from '~/pages/new/CoursesControl';
import CoursesControlEdit from '~/pages/new/CoursesControlEdit';
import ModelDetail from '~/pages/new/ModelDetail';

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
    { path: '/course', component: Course, layout: FullLayout },

    { path: '/NotAuthorized', component: NotAuthorized, layout: null },

    { path: '/test/footer', component: FooterHome, layout: null },
    { path: '/test/header', component: Header, layout: null },
    { path: '/test/test-page', component: TestPage, layout: null },
    { path: '/test/admin-test', component: AdminTestPage, layout: null },
    { path: '/test/course-layout', component: CourseLearning, layout: null },

    { path: '/company/course', component: CoursesControl, layout: AdminLayout },
    { path: '/company/course/view/:id', component: CoursesControlEdit, layout: AdminLayout },
    { path: '/company/blog-management', component: BlogsManagement, layout: AdminLayout },
    { path: '/company/account-management', component: EmployeesManagement, layout: AdminLayout },
    { path: '/company/payment-management', component: PaymentsManagement, layout: AdminLayout },
    { path: '/company/dashboard', component: DashboardManagement, layout: AdminLayout },
    { path: '/company/course-management', component: CoursesManagement, layout: AdminLayout },
    { path: '/company/model-management', component: ModelsManagement, layout: AdminLayout },
    { path: '/company/model-management/view', component: ModelDetail, layout: AdminLayout },
    { path: '/company/model-request-management', component: ModelRequestManagement, layout: AdminLayout },
    {
        path: '/company/payment-subscription-management',
        component: PaymentAndSubscriptionManagement,
        layout: AdminLayout,
    },

    { path: '/admin/dashboard', component: DashboardManagement, layout: AdminLayout },
    {
        path: '/admin/company-management',
        component: CompaniesManagement,
        layout: AdminLayout,
    },
    // {
    //     path: '/admin/account-management',
    //     component: AccountsManagement,
    //     layout: AdminLayout,
    // },
];

const adminRoutes = [];

const privateRoutes = [];

export { adminRoutes, privateRoutes, publicRoutes };
