"use client";
import { useState, useEffect } from "react";

export const useNavbarStyles = () => {
    const [isScrolledPastScreenHeight, setIsScrolledPastScreenHeight] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolledPast = window.scrollY >= window.innerHeight - 60;
            setIsScrolledPastScreenHeight(isScrolledPast);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const getBgClass = () => {
        if (isScrolledPastScreenHeight) {
            return "bg-dark-red";
        }
        return "bg-transparent";
    };

    const getRoundedClass = () => {
        if (isScrolledPastScreenHeight) {
            return "rounded-2xl";
        }
        return "";
    };

    const getPositionClass = () => {
        if (isScrolledPastScreenHeight) {
            return "top-4 scale-95";
        }
        return "top-0";
    };

    return {
        isScrolledPastScreenHeight,
        bgClass: getBgClass(),
        roundedClass: getRoundedClass(),
        positionClass: getPositionClass(),
    };
};