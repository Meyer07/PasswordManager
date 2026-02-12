import React, {useState,useEffect} from 'react'
import {Copy,Clock,Check} from 'lucide-react'
import totpUtils from PasswordManager/src/utils/totp.js

const TOTPDisplay=({secret})=>
{
    const [totp,setTOTP]=useState({ code: '------', timeRemaining: 30 });
    const [copied,setCopied]=useState(false);

    useEffect()=>
    {
        if(!secret)
        {
            return true;
        }
    }

    const updateTOTP=async()=>
    {
        const result=await totpUtils.generateTOTP(secret);
        setTOTP(result);
    }

    updateTOTP();

    const interval=setInterval(updateTOTP,1000);

    return ()=>clearInterval(interval);
},{secret};
