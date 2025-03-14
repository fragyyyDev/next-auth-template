"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";

const Navbar = () => {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen((prev) => !prev);
    };

    return (
        <header className="bg-white shadow relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="text-2xl font-bold text-blue-600">
                        <a href="/">Logo</a>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8 items-center">
                        {session ? (
                            <>
                                <a
                                    href="/dashboard"
                                    className="text-blue-600 hover:text-blue-800 transition duration-300"
                                >
                                    Dashboard
                                </a>
                                <a
                                    href="/profile"
                                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition duration-300"
                                >
                                    {session.user?.image && (
                                        <img
                                            src={session.user.image}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full"
                                        />
                                    )}
                                    <span>{session.user?.name || "Profil"}</span>
                                </a>
                            </>
                        ) : (
                            <>
                                <a
                                    href="/signin"
                                    className="text-blue-600 hover:text-blue-800 transition duration-300"
                                >
                                    Přihlásit se
                                </a>
                                <a
                                    href="/register"
                                    className="text-blue-600 hover:text-blue-800 transition duration-300"
                                >
                                    Registrovat se
                                </a>
                            </>
                        )}
                    </nav>

                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-blue-600 hover:text-blue-800 focus:outline-none"
                            aria-label="Toggle navigation"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={`fixed top-0 right-0 h-full w-3/4 bg-white shadow-lg z-50 transform transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label="Close mobile menu"
                >
                    <X size={24} />
                </button>

                <nav className="px-4 pt-16 pb-4 space-y-4">
                    {session ? (
                        <>
                            <a
                                href="/dashboard"
                                className="block px-3 py-2 rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </a>
                            <a
                                href="/profile"
                                className="flex items-center px-3 py-2 rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {session.user?.image && (
                                    <img
                                        src={session.user.image}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full mr-2"
                                    />
                                )}
                                {session.user?.name || "Profil"}
                            </a>
                        </>
                    ) : (
                        <>
                            <a
                                href="/signin"
                                className="block px-3 py-2 rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Přihlásit se
                            </a>
                            <a
                                href="/register"
                                className="block px-3 py-2 rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Registrovat se
                            </a>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
