import { Divider } from '@mui/material';
import classNames from 'classnames/bind';
import styles from '~/components/Layouts/DefaultLayout/DefaultLayout.module.scss';
import FooterHome from '~/parts/FooterHome';

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
    return (
        <div className={cx('page-container')}>
            <div className={cx('content-container')}>
                <div className={cx('content')}>{children}</div>
            </div>
            <Divider />
            <FooterHome />
        </div>
    );
}

export default DefaultLayout;
