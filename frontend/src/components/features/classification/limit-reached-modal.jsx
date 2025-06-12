"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/models/language-context";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Crown, AlertCircle } from "lucide-react";

export function LimitReachedModal({ isOpen, onClose, limitInfo }) {
    const { language } = useLanguage();
    const router = useRouter();

    const {
        plan = 'free',
        limit = 30,
        usageCount = 0,
        requireUpgrade = true,
        upgradeUrl = '/payment',
        message = language === 'id' 
            ? 'Anda telah mencapai batas klasifikasi harian. Silakan upgrade ke premium untuk klasifikasi lebih banyak.' 
            : 'You have reached your daily classification limit. Please upgrade to premium for more classifications.'
    } = limitInfo || {};

    const handleUpgrade = () => {
        onClose();
        router.push(upgradeUrl);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="sm:max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center justify-center gap-2 text-center">
                        <AlertCircle className="h-6 w-6 text-amber-500" />
                        <span className="text-xl font-bold">
                            {language === 'id' ? 'Batas Klasifikasi Tercapai' : 'Classification Limit Reached'}
                        </span>
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                        <p className="text-center text-amber-800">{message}</p>
                        
                        <div className="mt-4 flex justify-center items-center gap-2">
                            <span className="text-sm text-amber-700">
                                {language === 'id' ? 'Total Penggunaan:' : 'Total Usage:'}
                            </span>
                            <span className="font-bold text-amber-900">{usageCount} / {limit}</span>
                        </div>
                    </div>

                    {requireUpgrade && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                            <div className="flex items-center justify-center mb-3">
                                <Crown className="h-8 w-8 text-blue-600" />
                            </div>
                            
                            <h3 className="text-center font-semibold text-blue-900 mb-2">
                                {language === 'id' ? 'Upgrade ke Premium' : 'Upgrade to Premium'}
                            </h3>
                            
                            <ul className="space-y-2 text-sm text-blue-800 mb-4">
                                <li className="flex items-center">
                                    <span className="mr-2">✓</span>
                                    {language === 'id' ? '10.000 klasifikasi per bulan' : '10,000 classifications per month'}
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">✓</span>
                                    {language === 'id' ? 'Akses prioritas ke fitur baru' : 'Priority access to new features'}
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">✓</span>
                                    {language === 'id' ? 'Dukungan premium' : 'Premium support'}
                                </li>
                            </ul>

                            <div className="text-center font-medium text-blue-600 mb-3">
                                Rp 99.000 {language === 'id' ? 'per bulan' : 'per month'}
                            </div>
                        </div>
                    )}

                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
                        {requireUpgrade && (
                            <Button 
                                onClick={handleUpgrade}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                {language === 'id' ? 'Upgrade Sekarang' : 'Upgrade Now'}
                            </Button>
                        )}
                        
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                        >
                            {language === 'id' ? 'Kembali' : 'Go Back'}
                        </Button>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
