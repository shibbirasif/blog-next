'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from 'flowbite-react';
import { FaRobot, FaCheckCircle } from 'react-icons/fa';

interface AIStatusIndicatorProps {
    className?: string;
}

export default function AIStatusIndicator({ className = '' }: AIStatusIndicatorProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [overallStatus, setOverallStatus] = useState<'online' | 'offline'>('offline');

    const checkAIStatus = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/status');
            if (response.ok) {
                const data = await response.json();
                // Since we now only show active AI agent, use the overall status directly
                setOverallStatus(data.overall || 'offline');
            } else {
                setOverallStatus('offline');
            }
        } catch (error) {
            setOverallStatus('offline');
            console.error('Failed to check AI status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAIStatus();
        // Check status every 30 seconds
        const interval = setInterval(checkAIStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
                return 'success';
            default:
                return 'failure';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online':
                return <FaCheckCircle className="w-3 h-3" />;
            default:
                return <FaRobot className="w-3 h-3" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'online':
                return 'AI Ready';
            default:
                return 'AI Offline';
        }
    };

    if (isLoading) {
        return (
            <div className={`flex items-center ${className}`}>
                <Badge color="gray" icon={FaRobot}>
                    Checking AI...
                </Badge>
            </div>
        );
    }

    return (
        <div className={`flex items-center ${className}`}>
            <Badge
                color={getStatusColor(overallStatus)}
                icon={() => getStatusIcon(overallStatus)}
            >
                {getStatusText(overallStatus)}
            </Badge>
        </div>
    );
}
