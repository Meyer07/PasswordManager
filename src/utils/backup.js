import encryptionUtils from './encryption'


const BACKUP_FORMAT='password-manager-backup';
const BACKUP_VERSION='1.0.0';
const MAX_AUTO_BACKUPS=3;
const AUTO_BACKUP_KEY='pm_auto_backups';

const MAX_FILE_SIZE=5*1024*1024;
const MAX_ENTRY_COUNT=1000;
const MAX_FIELD_LENGTH=2048;

const ALLOWED_ENTRY_KEYS = new Set(['id', 'site', 'username', 'password', 'totpSecret', 'createdAt', 'importedAt']);

const sanitize_entry=(entry)=>
{
    //checks to see if the entry given by user is just a plain object
    if(!entry||typeof entry !== 'object' || Array.isArray(entry))
    {
        return null;
    }
    //checks if the entry is carrying potentially dangerous keys
    const own_keys=Object.keys(entry);
    if(own_keys.includes('__proto__')||own_keys.includes('constructor')||own_keys.includes('prototype'))
    {
        return null;
    }
    const {site,username,password}=entry;
    //following checks see if certain aspects of an entry are empty or null values
    if(typeof site !=='string' || !site.trim())
    {
        return null;
    }
    if(typeof username !=='string'||!username.trim())
    {
        return null;
    }
    if(typeof password !=='string'||!password.trim())
    {
        return null;
    }

    //checks if each entry is less then the maximum length set earlier on in the file
    for(const key of ALLOWED_ENTRY_KEYS)
    {
        if(entry[key]!==undefined && typeof entry[key]==='string' && entry[key].length>MAX_FIELD_LENGTH)
        {
            return null;
        }
    }

    //cleans the entries with clean keys and removes any injected fields
    const clean={};
    for(const key of ALLOWED_ENTRY_KEYS)
    {
        if(entry[key]!==undefined)
        {
            const val=entry[key];
            if(typeof val !== 'string' && typeof val !=='number')
            {
                return null;
            }
            clean[key]=val;
        }
    }


    clean.importedAt=clean.importedAt || new Date().toISOString();
    return clean;
};

const backupUtils=
{

    // Export: encrypt the current password array and return a downloadable string.
    // Uses a chunked base64 encoder to avoid the max-call-stack error that occurs
    // when spreading large Uint8Arrays into String.fromCharCode.
    export_vault:async(passwords,masterPassword)=>
    {
        const encoder=new TextEncoder();
        const salt=crypto.getRandomValues(new Uint8Array(16));
        const iv=crypto.getRandomValues(new Uint8Array(12));

        const key_material=await crypto.subtle.importKey(
            'raw',
            encoder.encode(masterPassword),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        const key=await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
            key_material,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(JSON.stringify(passwords))
        );

        const combined=new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);

        let binary='';
        const chunk_size=8192;
        for(let i=0;i<combined.length;i+=chunk_size)
        {
            binary += String.fromCharCode(...combined.subarray(i, i + chunk_size));
        }

        const encrypted_base_64= btoa(binary);

        const payload = {
            version: BACKUP_VERSION,
            format: BACKUP_FORMAT,
            timestamp: new Date().toISOString(),
            passwordCount: passwords.length,
            encrypted: encrypted_base_64,
          };
          return JSON.stringify(payload, null, 2);

        
    },

    //triggers the browser download of the passwords
    download_backup: async(data,filename)=>
    {  
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    // Read, validate, and structurally check an uploaded backup file.
    // Rejects oversized files, invalid JSON, wrong format, and missing fields.
    // Returns the parsed backup object or throws a descriptive error.
    parse_backup_file:async(file)=>
    {
        return new Promise((resolve,reject)=>
        {
            if(!file)
            {
                return reject(new Error("No file selected"));
            }
            if(!file.name.endsWith('.json') && file.type !== 'application/json')
            {
                return reject(new Error("Invalid file type, please select a .json backup file"));
            }
            if(file.size>MAX_FILE_SIZE)
            {
                return reject(new Error("Error: file size is too big"));
            }


            const reader=new FileReader();

            reader.onload=(e)=>
            {
                let parsed;

                //JSON parse on the untrusted object
                try
                {
                    parsed=JSON.parse(e.target.result);
                }catch
                {
                    return reject(new Error("Error, File input may have been corrupted or not a valid file type"));
                }

                if(!parsed || typeof parsed !=='object' || Array.isArray(parsed))
                {
                    return reject(new Error("Error, Backup file has an unexpected structure"));
                }
                const own_keys=Object.keys(parsed);
                if(own_keys.includes('__proto__')||own_keys.includes('constructor')||own_keys.includes('prototype'))
                {
                    return reject(new Error("Error, Backup file failed security validation "))
                }
                if(parsed.format!==BACKUP_FORMAT)
                {
                    return reject(new Error("Error, This file is not a valid vault backup"));
                }
                if(typeof parsed.version !== 'string')
                {
                    return reject(new Error("Error, this backup file is missing a version field"));
                }
                if(typeof parsed.encrypted !=='string' || !parsed.encrypted.trim())
                {
                    return reject(new Error("Error, file is missing encrypted data, it may have been corrupted"));
                }
                if(typeof parsed.timestamp !=='string' || !parsed.timestamp.trim())
                {
                    return reject(new Error("Error, this backup is missing its timestamp"));
                }
                if (!/^[A-Za-z0-9+\/=]+$/.test(parsed.encrypted.trim()))
                {
                    return reject(new Error("Error, backup file contains invalid encrypted data"));
                }

                resolve(parsed);
            }
            reader.onerror = () =>reject(new Error("Error, Failed to read file please try again"));
            reader.readAsText(file);
        });
    },
    // Decrypt a validated backup and return a sanitized password array.
    // Returns null if decryption fails (wrong password or corrupted payload).
    // Silently drops any entries that fail sanitization.
    import_vault:async(parsed_backup,masterPassword)=>
    {
        const decrypted=await encryptionUtils.decrypt(parsed_backup.encrypted,masterPassword);

        if(!decrypted)
        {
            return null;
        }
        let raw; 
        try{
            raw=JSON.parse(decrypted);
        }catch{
            return null;
        }
        //decrypted payload must be an array
        if(!Array.isArray(raw))
        {
            return null;
        }

        //cap entry count before iterating, protects against memory exhasution
        const capped=raw.slice(0,MAX_ENTRY_COUNT);

        //sanitize each entry, siliently dropping any that don't pass the check
        const passwords=capped.map(sanitize_entry).filter(Boolean);

        return passwords;
    },
    //Merge strategy: skip duplicates
    //a duplicate is any imported entry that shares the same site+username as an existing one
    merge_vaults:(existing,imported)=>
    {
        const seen= new Set(existing.map(p=>`${p.site}|${p.username}`));
        const newEntries=imported.filter(p => !seen.has(`${p.site}|${p.username}`));

        return{
            merged:[...existing,...newEntries],
            added:newEntries.length,
            skipped:imported.length-newEntries.length
        };
    },
    //saves a snapshot to local storage, keeping only the MAX_AUTO_BACKUPS
    save_auto_backup:async(passwords,masterPassword)=>
    {
        try{
            const encrypted=await encryptionUtils.encrypt(JSON.stringify(passwords),masterPassword);

            const snapshot={
                timestamp:new Date().toISOString(),
                password_count:passwords.length,
                encrypted,
            };
            const existing=backupUtils.get_auto_backups();
            const updated=[snapshot, ...existing].slice(0, MAX_AUTO_BACKUPS);
            localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(updated));
            return true;
        }catch{
            return false;
        }
    },
    //retrieves all stored auto-backup snapshots
    get_auto_backups:async()=>
    {
        try{
            const raw=localStorage.getItem(AUTO_BACKUP_KEY);
            return raw? JSON.parse(raw):[];
        }catch{
            return [];
        }
    },
    // Decrypt and return passwords from a specific auto-backup snapshot
    restore_auto_backups:async(snapshot,masterPassword)=>
    {
        const decrypted=await encryptionUtils.decrypt(snapshot.encrypted,masterPassword);
        if(!decrypted)
        {
            return null;
        }
        try{
            const passwords=JSON.parse(decrypted);
            return Array.isArray(passwords) ? passwords:null;
        }catch{
            return null;
        }
    },
};

export default backupUtils;

