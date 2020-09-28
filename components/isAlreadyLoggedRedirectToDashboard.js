import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Cookies } from 'react-cookie';

export default function () {
    const router = useRouter();
    const cookies = new Cookies();

    useEffect(() => {
        if (cookies.get('token')) {
            router.push('/dashboard');
        }
    }, []);

    return <></>
}
