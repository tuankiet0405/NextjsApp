import Link from "next/link";

function Footer() {
    return (
        <footer className="bg-primary-900 border-t border-primary-800 mt-auto">
            <div className="max-w-7xl mx-auto px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div>
                        <h3 className="text-accent-400 font-semibold text-xl mb-3">
                            The Wild Oasis
                        </h3>
                        <p className="text-primary-300 text-sm leading-relaxed">
                            Luxurious cabin hotel nestled in the heart of the Italian
                            Dolomites. Reconnect with nature in comfort and style.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-primary-100 font-semibold mb-3">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/cabins"
                                    className="text-primary-300 hover:text-accent-400 transition-colors"
                                >
                                    Our Cabins
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="text-primary-300 hover:text-accent-400 transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/account"
                                    className="text-primary-300 hover:text-accent-400 transition-colors"
                                >
                                    Guest Area
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-primary-100 font-semibold mb-3">Contact</h4>
                        <ul className="space-y-2 text-sm text-primary-300">
                            <li>📍 Dolomites, South Tyrol, Italy</li>
                            <li>📧 info@thewildoasis.com</li>
                            <li>📞 +39 0471 000 000</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-primary-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-primary-400 text-sm">
                        &copy; {new Date().getFullYear()} The Wild Oasis. All rights
                        reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <a
                            href="#"
                            className="text-primary-400 hover:text-accent-400 transition-colors"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-primary-400 hover:text-accent-400 transition-colors"
                        >
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
