import encryptionUtils from './encryption';


const recoveryUtils=
{
    generateRecoveryKey:()=>
    {
        const keyBytes=crypto.getRandomValues(new Uint8Array(32));
        return btoa(String.fromCharCode(...keyBytes));
    },

    encryptMasterHash:async(masterHash,recoveryKey) =>
    {
        try
        {
            return await encryptionUtils.encrypt(masterHash,recoveryKey);
        }catch(error)
        {
            console.error('failed to encrypt master hash:', error)
            return null;
        }
    },

    decryptMasterHash: async(masterHash,recoveryKey)=>
    {
        try
        {
            return await encryptionUtils.decrypt(masterHash,recoveryKey);
        }catch(error)
        {
            console.error('Error decrypting masterHash:',error);
            return null;
        }
    },

    validateRecoveryKey: (key)=>
    {
        if(!key|| typeof key !=='string')
        {
            return {valid:false,error:"recovery key is required"};
        }


        if(key.length<40)
        {
            return{valid:false,error:"Recovery key is too short"};
        }
        try{
            atob(key);
            return{valid:true};
        }catch(error)
        {
            return{valid:false,error:"Invalid recovery key format:",error};
        }
    }


};

export default recoveryUtils;