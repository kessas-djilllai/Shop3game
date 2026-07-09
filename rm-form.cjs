const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

// Replace {!showForm ? ( with nothing, but preserve the div inside
file = file.replace(/\{\!showForm \? \(/, '<>');

// Remove the ) : ( and everything until the end )} before </div></div>
const formStart = file.indexOf(') : (');
if (formStart !== -1) {
    const endForm = file.lastIndexOf(')}');
    if (endForm !== -1) {
        file = file.substring(0, formStart) + '</>\n' + file.substring(endForm + 2);
    }
}

fs.writeFileSync('src/pages/Account.tsx', file);
