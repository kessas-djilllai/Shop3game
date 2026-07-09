const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

const oldFetchMessages = `
  const fetchMessages = async (tkn: string) => {
    setRefreshing(true);
    try {
      const res = await axios.get('https://api.mail.tm/messages', {
        headers: { Authorization: \`Bearer \$\{tkn\}\` }
      });
      const allMsgs = res.data['hydra:member'] || [];
      
      const thirtyHoursMs = 30 * 60 * 60 * 1000;
      const now = Date.now();
      const validMsgs = [];
      
      for (const msg of allMsgs) {
        const msgTime = new Date(msg.createdAt).getTime();
        if (now - msgTime > thirtyHoursMs) {
          // Delete old message
          axios.delete(\`https://api.mail.tm/messages/\$\{msg.id\}\`, {
            headers: { Authorization: \`Bearer \$\{tkn\}\` }
          }).catch(() => {});
        } else {
          validMsgs.push(msg);
        }
      }

      setMessages(validMsgs);
      
      // Sync to database
      if (validMsgs && validMsgs.length > 0) {
        const ff_token = localStorage.getItem('ff_token');
        if (ff_token) {
          try {
            const syncRes = await axios.post('/api/messages/sync', { messages: validMsgs }, {
              headers: { Authorization: \`Bearer \$\{ff_token\}\` }
            });
            const seenIds = syncRes.data.seen_messages || [];
            if (seenIds.length > 0) {
              setMessages(currentMsgs => currentMsgs.map(m => seenIds.includes(m.id) ? { ...m, seen: true } : m));
            }
          } catch(syncErr) {
            console.error("Failed to sync messages to DB", syncErr);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };`;

const newFetchMessages = `
  const fetchMessages = async (tkn: string) => {
    setRefreshing(true);
    try {
      const res = await axios.get('https://api.mail.tm/messages', {
        headers: { Authorization: \`Bearer \$\{tkn\}\` }
      });
      const allMsgs = res.data['hydra:member'] || [];
      
      const thirtyHoursMs = 30 * 60 * 60 * 1000;
      const now = Date.now();
      const validMsgs = [];
      
      for (const msg of allMsgs) {
        const msgTime = new Date(msg.createdAt).getTime();
        if (now - msgTime > thirtyHoursMs) {
          // Delete old message
          axios.delete(\`https://api.mail.tm/messages/\$\{msg.id\}\`, {
            headers: { Authorization: \`Bearer \$\{tkn\}\` }
          }).catch(() => {});
        } else {
          validMsgs.push(msg);
        }
      }

      // Fetch Local Messages
      let localMsgs = [];
      const ff_token = localStorage.getItem('ff_token');
      if (ff_token) {
        try {
           const localRes = await axios.get('/api/messages/local', {
               headers: { Authorization: \`Bearer \$\{ff_token\}\` }
           });
           localMsgs = localRes.data || [];
        } catch (e) {
           console.error("Failed to fetch local messages", e);
        }
      }

      const combinedMsgs = [...validMsgs, ...localMsgs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setMessages(combinedMsgs);
      
      // Sync to database
      if (validMsgs && validMsgs.length > 0) {
        if (ff_token) {
          try {
            const syncRes = await axios.post('/api/messages/sync', { messages: validMsgs }, {
              headers: { Authorization: \`Bearer \$\{ff_token\}\` }
            });
            const seenIds = syncRes.data.seen_messages || [];
            if (seenIds.length > 0) {
              setMessages(currentMsgs => currentMsgs.map(m => seenIds.includes(m.id) ? { ...m, seen: true } : m));
            }
          } catch(syncErr) {
            console.error("Failed to sync messages to DB", syncErr);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };`;

file = file.replace(oldFetchMessages, newFetchMessages);


const oldGetMessageDetails = `
  const getMessageDetails = async (id: string, isSeen?: boolean) => {
    try {
      if (!isSeen) {
        setMessages(msgs => msgs.map(m => m.id === id ? { ...m, seen: true } : m));
        
        // Save to DB
        const ff_token = localStorage.getItem('ff_token');
        if (ff_token) {
          axios.post('/api/messages/mark-seen', { message_id: id }, {
            headers: { Authorization: \`Bearer \$\{ff_token\}\` }
          }).catch(err => console.error("Failed to mark message as seen in DB", err));
        }

        // Also update mail.gw natively for good measure
        axios.patch(\`https://api.mail.tm/messages/\$\{id\}\`, { seen: true }, {
          headers: { 
            Authorization: \`Bearer \$\{token\}\`,
            'Content-Type': 'application/merge-patch+json'
          }
        }).catch(() => {});
      }
      const res = await axios.get(\`https://api.mail.tm/messages/\$\{id\}\`, {
        headers: { Authorization: \`Bearer \$\{token\}\` }
      });
      setMessageContent(res.data);
    } catch (err: any) {
      if (err.response?.status !== 404 && err.response?.status !== 401) {
        console.error(err);
      }
    }
  };`;

const newGetMessageDetails = `
  const getMessageDetails = async (id: string, isSeen?: boolean) => {
    try {
      if (!isSeen) {
        setMessages(msgs => msgs.map(m => m.id === id ? { ...m, seen: true } : m));
        
        // Save to DB
        const ff_token = localStorage.getItem('ff_token');
        if (ff_token) {
          axios.post('/api/messages/mark-seen', { message_id: id }, {
            headers: { Authorization: \`Bearer \$\{ff_token\}\` }
          }).catch(err => console.error("Failed to mark message as seen in DB", err));
        }

        // Also update mail.gw natively for good measure
        if (!id.startsWith('local-')) {
          axios.patch(\`https://api.mail.tm/messages/\$\{id\}\`, { seen: true }, {
            headers: { 
              Authorization: \`Bearer \$\{token\}\`,
              'Content-Type': 'application/merge-patch+json'
            }
          }).catch(() => {});
        }
      }
      
      if (id.startsWith('local-')) {
          const ff_token = localStorage.getItem('ff_token');
          const res = await axios.get(\`/api/messages/local/\$\{id\}\`, {
            headers: { Authorization: \`Bearer \$\{ff_token\}\` }
          });
          setMessageContent(res.data);
      } else {
          const res = await axios.get(\`https://api.mail.tm/messages/\$\{id\}\`, {
            headers: { Authorization: \`Bearer \$\{token\}\` }
          });
          setMessageContent(res.data);
      }
    } catch (err: any) {
      if (err.response?.status !== 404 && err.response?.status !== 401) {
        console.error(err);
      }
    }
  };`;

file = file.replace(oldGetMessageDetails, newGetMessageDetails);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
