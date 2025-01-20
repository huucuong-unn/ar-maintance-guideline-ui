import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles.css';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';

export default function FooterHome() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="row">
                    <div className="col col-6">
                        <h1>tortee</h1>
                    </div>

                    <div className="col col-2">
                        <h6>About Us</h6>
                        <ul className="footer-links">
                            <li>
                                <a href="#">Our Story</a>
                            </li>
                            <li>
                                <a href="#">Why Us</a>
                            </li>
                            <li>
                                <a href="#">Term of Use</a>
                            </li>
                        </ul>
                    </div>

                    <div className="col col-2">
                        <h6>Features</h6>
                        <ul className="footer-links">
                            <li>
                                <a href="#">C</a>
                            </li>
                            <li>
                                <a href="#">UI Design</a>
                            </li>
                            <li>
                                <a href="#">PHP</a>
                            </li>
                        </ul>
                    </div>

                    <div className="col col-2">
                        <h6>Contact</h6>
                        <ul className="footer-links">
                            <li>
                                <a href="#">About Us</a>
                            </li>
                            <li>
                                <a href="#">Contact Us</a>
                            </li>
                            <li>
                                <a href="#">Contribute</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <hr />
            </div>
            <div className="container">
                <div className="row">
                    <div className="col col-8">
                        <p className="copyright-text">
                            Copyright &copy; 2024 All Rights Reserved by {''}
                            <a href="#">Tortee</a>.
                        </p>
                    </div>

                    <div className="col col-4">
                        <ul className="social-icons">
                            <li>
                                <a className="facebook" href="#">
                                    <FontAwesomeIcon icon={faFacebook} />
                                </a>
                            </li>
                            <li>
                                <a className="instagram" href="#">
                                    <FontAwesomeIcon icon={faInstagram} />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
