import React from 'react'
import {Shield,AlertTriangle,CheckCircle} from 'lucide-react'


const BreachIndicator=([breachStatus])=>
{
    if(!breachStatus) return null;

    if(breachStatus.error)
    {
        return(
            <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
                <Shield className="w-3,h-3"/>
                <span>Breach check unavailable</span>
            </div>
        );
    }
    if(breachStatus.breached)
    {
        return(
            <div className="bg-red-900/30 border border-red-700 rounded p-2 mt-2">
                <div className="flex items-center gap-2 text-red-200 text-xs">
                    <AlertTriangle className="w-4,h-4"/>
                    <div>
                        <p className='font-semibold'>⚠️ Password Compromised</p>
                        <p className="text-red-300">
                            Found in {breachStatus.count.toLocaleString()} data breaches. 
                            Change this password immediately!
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2 text-green-400 text-xs mt-2">
          <CheckCircle className="w-3 h-3" />
          <span>No known breaches</span>
        </div>
    );
}
export default BreachIndicator