const breachCheckUtils=
{
    sha1Hash: async (password) =>
    {
        const encoder =new TextEncoder();
        const data =encoder.encode(password);
        const hashBuffer=await crypto.subtle.digest('SHA-1',data);
        const hashArray=Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b=> b.toString(16).padStart(2,'0')).join('').toUpperCase();

    },

    checkPassword: async (password)=>
    {
        try
        {
            const hash= await breachCheckUtils.sha1Hash(password);

            const prefix=hash.substring(0,5);
            const suffix=hash.substring(5);

            const response=await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)

            if(!response.ok)
            {
                throw new Error("Error failed to check password");
            }

            const text=await response.text();

            const hashes=text.split('\n');

            for(const line of hashes)
            {
                const [hashSuffix, count]=line.split(':');
                if(hashSuffix===suffix)
                {
                    return{
                        breached:true,
                        count:parseInt(count,10),
                        message:`This password has been seen ${parseInt(count, 10).toLocaleString()} times in data breaches`
                    };
                }
            }
            
            return{
                breached: false,
                count: 0,
                message: "This password has not been found in any data breaches"
            };
        }catch(error)
        {
            console.error('Breach Check Failed',error);
            return{
                breached:null,
                count:null,
                Message:"Unable to check password for any data breaches",
                error:true
            };
        }
    },

    checkMultiplePasswords: async (passwords)=>
    {
        const results=[];

        for(const entry in passwords)
        {
            const result=await breachCheckUtils.checkPassword(entry.password);
            results.push(
                {
                    id: entry.id,
                    site:entry.site,
                    username:entry.username,
                    ...result
                }
            );

            await new Promise(resolve=>setTimeout(resolve,100))
        }
        return results;
    }

}
export default breachCheckUtils;