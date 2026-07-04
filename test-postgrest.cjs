const account_id = "test,foo";
console.log(`id_account.eq."${account_id.replace(/"/g, '\\"')}",account_name.eq."${account_id.replace(/"/g, '\\"')}"`);
