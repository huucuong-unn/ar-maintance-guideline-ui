import { onMessage } from 'firebase/messaging';
import { Fragment, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { generateToken, messaging } from './firebase';
import FullLayout from './components/Layouts/FullLayout';
import { adminRoutes, publicRoutes, companyRoutes, designerRoutes, managerRoutes } from './routes';
import ProtectedRoutes from './components/ProtectedRoutes';
import AdminLayout from './components/Layouts/AdminLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
    useEffect(() => {
        generateToken();
        onMessage(messaging, (payload) => {
            console.log(payload);
            toast(payload.notification.body);
        });
    }, []);

    return (
        <div>
            <Router>
                <div className="App">
                    <Toaster position="top-right"></Toaster>
                    <ToastContainer />
                    <Routes>
                        {publicRoutes.map((route, index) => {
                            const Page = route.component;
                            let Layout = FullLayout;

                            if (route.layout) {
                                Layout = route.layout;
                            } else if (route.layout === null) {
                                Layout = Fragment;
                            }
                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    }
                                />
                            );
                        })}
                        <Route element={<ProtectedRoutes roleName={'ADMIN'} />}>
                            {adminRoutes.map((route, index) => {
                                const Page = route.component;
                                let Layout = AdminLayout;

                                if (route.layout) {
                                    Layout = route.layout;
                                } else if (route.layout === null) {
                                    Layout = Fragment;
                                }
                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        }
                                    />
                                );
                            })}
                        </Route>
                        <Route element={<ProtectedRoutes roleName={'COMPANY'} />}>
                            {companyRoutes.map((route, index) => {
                                const Page = route.component;
                                let Layout = AdminLayout;

                                if (route.layout) {
                                    Layout = route.layout;
                                } else if (route.layout === null) {
                                    Layout = Fragment;
                                }
                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        }
                                    />
                                );
                            })}
                        </Route>
                        <Route element={<ProtectedRoutes roleName={'DESIGNER'} />}>
                            {designerRoutes.map((route, index) => {
                                const Page = route.component;
                                let Layout = AdminLayout;

                                if (route.layout) {
                                    Layout = route.layout;
                                } else if (route.layout === null) {
                                    Layout = Fragment;
                                }
                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        }
                                    />
                                );
                            })}
                        </Route>
                        <Route element={<ProtectedRoutes roleName={'MANAGER'} />}>
                            {managerRoutes.map((route, index) => {
                                const Page = route.component;
                                let Layout = AdminLayout;

                                if (route.layout) {
                                    Layout = route.layout;
                                } else if (route.layout === null) {
                                    Layout = Fragment;
                                }
                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        }
                                    />
                                );
                            })}
                        </Route>
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
