// components/Footer.tsx
import React from 'react';
import { Facebook, Linkedin, Youtube, Instagram } from 'lucide-react';
import type {TopicLinkProps} from '../types';

const TopicLink: React.FC<TopicLinkProps> = ({ children }) => (
    <a
        href="#"
        className="text-gray-600 hover:text-purple-600 transition-colors block"
        onClick={(e) => e.preventDefault()}
    >
        {children}
    </a>
);

const Footer: React.FC = () => {
    const socialLinks = [
        { icon: Facebook, href: "#", label: "Facebook", hoverColor: "hover:text-blue-600" },
        { icon: Linkedin, href: "#", label: "LinkedIn", hoverColor: "hover:text-blue-700" },
        { icon: Youtube, href: "#", label: "YouTube", hoverColor: "hover:text-red-600" },
        { icon: Instagram, href: "#", label: "Instagram", hoverColor: "hover:text-pink-600" },
    ];

    return (
        <footer className="border-t border-gray-200 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Site Info */}
                <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-4">Site name</h3>
                    <div className="flex gap-4">
                        {socialLinks.map(({ icon: Icon, href, label, hoverColor }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className={`text-gray-600 ${hoverColor} cursor-pointer transition-colors`}
                                onClick={(e) => e.preventDefault()}
                            >
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Topics Columns */}
                {Array.from({ length: 3 }, (_, index) => (
                    <div key={index}>
                        <h4 className="font-semibold text-gray-900 mb-4">Topic</h4>
                        <div className="space-y-2">
                            <TopicLink>Page</TopicLink>
                            <TopicLink>Page</TopicLink>
                            <TopicLink>Page</TopicLink>
                            <TopicLink>Page</TopicLink>
                        </div>
                    </div>
                ))}
            </div>
        </footer>
    );
};

export default Footer;