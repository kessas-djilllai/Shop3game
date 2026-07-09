const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

const oldFetchMessages = `
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
      
      setMessages(combinedMsgs);`;

const newFetchMessages = `
      setMessages(validMsgs);
`;

file = file.replace(oldFetchMessages, newFetchMessages);

const oldGetMessageDetails = `
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
      }`;

const newGetMessageDetails = `
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
      setMessageContent(res.data);`;

file = file.replace(oldGetMessageDetails, newGetMessageDetails);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
