import { onMessage } from 'firebase/messaging';
import { Fragment, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { generateToken, messaging } from './firebase';
import FullLayout from './components/Layouts/FullLayout';
import { adminRoutes, publicRoutes } from './routes';
import ProtectedRoutes from './components/ProtectedRoutes';
function App() {
    useEffect(() => {
        generateToken();
        onMessage(messaging, (payload) => {
            console.log(payload);
            toast(payload.notification.body);
        });
    }, []);

    return (
        <Router>
            <div className="App">
                <Toaster position="top-right"></Toaster>
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
                    <Route element={<ProtectedRoutes roleName={'admin'} />}>
                        {adminRoutes.map((route, index) => {
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
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
