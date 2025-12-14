"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import {
    HelpCircle, Book, MessageCircle, Video, FileText, ExternalLink,
    Search, ChevronDown, ChevronRight, Mail, Phone, Clock
} from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
    {
        question: "How do I add a new product?",
        answer: "Go to Products > click 'Add Product' button > fill in the product details including name, price, description, and images > click 'Save' to publish your product.",
    },
    {
        question: "How do I process an order?",
        answer: "Navigate to Orders > click on the order you want to process > change the status from 'Pending' to 'Processing' > when shipped, update to 'Shipped' and add tracking information.",
    },
    {
        question: "How do I set up shipping zones?",
        answer: "Go to Shipping settings > click 'Add Zone' > select the countries/regions > add shipping methods with prices > save your changes.",
    },
    {
        question: "How do I export my products?",
        answer: "Go to Products > click 'Import/Export' > select 'Export' tab > choose the format (CSV or Excel) > click 'Download' to get your product data.",
    },
    {
        question: "How do I connect a payment gateway?",
        answer: "Navigate to Payments settings > click 'Configure' on your preferred gateway (Stripe, PayPal) > enter your API credentials > toggle to enable the payment method.",
    },
];

const RESOURCES = [
    {
        icon: Book,
        title: "Documentation",
        description: "Comprehensive guides and tutorials",
        link: "#",
    },
    {
        icon: Video,
        title: "Video Tutorials",
        description: "Step-by-step video walkthroughs",
        link: "#",
    },
    {
        icon: FileText,
        title: "API Reference",
        description: "Developer documentation",
        link: "#",
    },
    {
        icon: MessageCircle,
        title: "Community Forum",
        description: "Get help from other users",
        link: "#",
    },
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const filteredFAQ = FAQ_ITEMS.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute>
            <DashboardLayout title="System" subtitle="Help">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-4">
                            <HelpCircle className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-100">How can we help you?</h1>
                        <p className="text-neutral-400 mt-2">Search our knowledge base or browse common topics</p>
                    </div>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for help..."
                                className="w-full pl-12 pr-4 py-4 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-lg"
                            />
                        </div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {RESOURCES.map((resource, index) => {
                            const Icon = resource.icon;
                            return (
                                <a
                                    key={index}
                                    href={resource.link}
                                    className="group p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-emerald-500/50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                            <Icon className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-neutral-200 flex items-center gap-1">
                                                {resource.title}
                                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </h3>
                                            <p className="text-sm text-neutral-500 mt-1">{resource.description}</p>
                                        </div>
                                    </div>
                                </a>
                            );
                        })}
                    </div>

                    {/* FAQ Section */}
                    <DashboardSection>
                        <h2 className="text-lg font-semibold text-neutral-100 mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                            {filteredFAQ.map((item, index) => (
                                <div
                                    key={index}
                                    className="border border-neutral-800 rounded-xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-800/50 transition-colors"
                                    >
                                        <span className="font-medium text-neutral-200">{item.question}</span>
                                        {openFAQ === index ? (
                                            <ChevronDown className="h-5 w-5 text-neutral-400" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-neutral-400" />
                                        )}
                                    </button>
                                    {openFAQ === index && (
                                        <div className="px-4 pb-4 text-neutral-400 text-sm leading-relaxed">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </DashboardSection>

                    {/* Contact Support */}
                    <DashboardSection>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-100">Still need help?</h3>
                                <p className="text-neutral-400 mt-1">Our support team is here to assist you</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg">
                                    <Mail className="h-4 w-4 text-neutral-400" />
                                    <span className="text-sm text-neutral-300">support@rodix.com</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg">
                                    <Clock className="h-4 w-4 text-neutral-400" />
                                    <span className="text-sm text-neutral-300">24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </DashboardSection>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
