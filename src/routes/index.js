import AdminLayout from '~/components/Layouts/AdminLayout';

//new
import BlogsManagement from '~/pages/new/BlogsManagement';
import CompaniesManagement from '~/pages/new/CompaniesManagement';
import CourseLearning from '~/pages/new/CourseLearning';
import CoursesManagement from '~/pages/new/CoursesManagement';
import DashboardManagement from '~/pages/new/DashboardManagement';
import EmployeesManagement from '~/pages/new/EmployeesManagement';
import Homepage from '~/pages/new/Homepage';
import ModelRequestManagement from '~/pages/new/ModelRequestManagement';
import ModelsManagement from '~/pages/new/ModelsManagement';
import PaymentAndSubscriptionManagement from '~/pages/new/PaymentAndSubscriptionManagement';
import PaymentFailed from '~/pages/new/PaymentFailed';
import PaymentsManagement from '~/pages/new/PaymentsManagement';
import PaymentSuccess from '~/pages/new/PaymentSuccess';
import NotAuthorized from '~/pages/NotAuthorized';
// import AccountsManagement from '~/pages/new/AccountsManagement ';
import AdminPlatformLayout from '~/components/Layouts/AdminPlatformLayout';
import AccountsManagement from '~/pages/new/AccountsManagement';
import CompanyLogin from '~/pages/new/CompanyLogin';
import CompanyRegister from '~/pages/new/CompanyRegister';
import CompanyWaiting from '~/pages/new/CompanyWaiting';
import CoursesControl from '~/pages/new/CoursesControl';
import CoursesControlEdit from '~/pages/new/CoursesControlEdit';
import ModelDetail from '~/pages/new/ModelDetail';
import UsersManagement from '~/pages/new/UsersManagement';
import ModelEditor from '~/pages/new/TestPage';
import MachinesManagement from '~/pages/new/Machine';
import MachineTypeManagement from '~/pages/new/MachineType';

const publicRoutes = [
    //new
    // { path: '/admin/login', component: LoginAdmin, layout: null },
    { path: '/', component: Homepage, layout: CompanyLogin },
    { path: '/payment/success', component: PaymentSuccess, layout: null },
    { path: '/payment/failed', component: PaymentFailed, layout: null },
    { path: '/not-authorized', component: NotAuthorized, layout: null },
    { path: '/test/test-page', component: ModelEditor, layout: null },
    { path: '/test/course-layout', component: CourseLearning, layout: null },

    { path: '/login', component: CompanyLogin, layout: null },
    { path: '/company/register', component: CompanyRegister, layout: null },
    { path: '/company/waiting', component: CompanyWaiting, layout: null },
];

const adminRoutes = [
    { path: '/admin/dashboard', component: DashboardManagement, layout: AdminLayout },
    { path: '/admin/company-management', component: CompaniesManagement, layout: AdminLayout },
    { path: '/admin/user-management', component: UsersManagement, layout: AdminPlatformLayout },
    { path: '/admin/account-management', component: AccountsManagement, layout: AdminLayout },
    { path: '/admin/payment-management', component: PaymentAndSubscriptionManagement, layout: AdminLayout },
];

const companyRoutes = [
    { path: '/company/course', component: CoursesControl, layout: AdminLayout },
    { path: '/company/course/view/:id', component: CoursesControlEdit, layout: AdminLayout },
    { path: '/company/blog-management', component: BlogsManagement, layout: AdminLayout },
    { path: '/company/account-management', component: EmployeesManagement, layout: AdminLayout },
    { path: '/company/payment-management', component: PaymentsManagement, layout: AdminLayout },
    { path: '/company/dashboard', component: DashboardManagement, layout: AdminLayout },
    { path: '/company/course-management', component: CoursesManagement, layout: AdminLayout },
    { path: '/company/model-management', component: ModelsManagement, layout: AdminLayout },
    { path: '/company/model-management/view/:id', component: ModelDetail, layout: AdminLayout },
    { path: '/company/model-request-management', component: ModelRequestManagement, layout: AdminLayout },
    {
        path: '/company/payment-subscription-management',
        component: PaymentAndSubscriptionManagement,
        layout: AdminLayout,
    },
    { path: '/company/machines-management', component: MachinesManagement, layout: AdminLayout },
    { path: '/company/machines-type-management', component: MachineTypeManagement, layout: AdminLayout },
];

const privateRoutes = [];

export { adminRoutes, companyRoutes, privateRoutes, publicRoutes };
