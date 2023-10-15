const fs = require('fs');
const MarkdownIt = require('markdown-it');
const htmlTableToJson = require('html-table-to-json');
const slugify = require('slugify');


const slug = (str) => slugify(str, {
    replacement: '_', // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: false, // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
});

function isValid(tab) {
    if (!tab.length) {
        // console.log("not found");
        return null;
    }

    const tabs = tab.map((t) => {
        const nt = {};

        Object.keys(t).forEach((key) => {
            nt[slug(key)] = t[key];
        });
        return nt;
    });
    // console.log(tabs);

    // console.log(tabs);

    const shouldExistsKeys = ['task_description', 'qty', 'price', 'task_name'];
    const keys = Object.keys(tabs[0]);

    const check = keys.filter((k) => !shouldExistsKeys.includes(k));

    // checking is all 4 are avail in array or not
    if (check.length) {
        return null;
    }

    // console.log(tab);
    const finalTabs = tabs.map((t) => {
        const nt = { total: t.qty * t.total, ...t };
        return nt;
    });

    // for (let i = 0; i < tab.length; i += 1) {
    //     const obj = tab[i];
    //     const newObj = {
    //         [column1]: '',
    //         [column2]: '',
    //         [column3]: 1,
    //         [column4]: 10.0,
    //     };

    //     // Task Name
    //     const taskName = obj[column1];
    //     if (taskName === Number(taskName)) {
    //         // console.log("not found");
    //         return null;
    //     }
    //     newObj[column1] = taskName;

    //     // Task Description
    //     const tastDescription = obj[column1];
    //     newObj[column2] = tastDescription;

    //     // QTY
    //     const QTY = Number(obj[column3]);
    //     if (!QTY || !Number.isInteger(QTY) || QTY <= 0) {
    //         // console.log("not found");
    //         return null;
    //     }
    //     newObj[column3] = parseInt(QTY, 10);

    //     // Price
    //     const Price = Number(obj[column4]);
    //     if (!Price || QTY <= 0) {
    //         // console.log("not found");
    //         return null;
    //     }

    //     newObj[column4] = Price;
    //     newObj.Total = Price * QTY;

    //     // console.log(newObj);
    //     table[i] = newObj;
    // }
	console.log(finalTabs);

    return finalTabs;
}

// function htmlToArrayOfObjects(dataHtml) {
//     const tables = htmlTableToJson.parse(dataHtml);
//     // console.log(tables.results);
//     let extractedTable;

//     tables.results.forEach((table) => {
//         // if (validTable(table)) console.log(table);
//         const tempTable = isValid(table);

//         if (tempTable) {
//             extractedTable = tempTable;
//             console.log(JSON.stringify(extractedTable));
//         }
//     });

//     return extractedTable;
// }

// fs.readFile('data.md', 'utf8', (err, data) => {
// });


try {
    // cheking the file exits or not
    if (!fs.existsSync('data.md')) {
        throw new Error('Error: no such file exists Or file is empty');
    }

    // reading the file
    const data = fs.readFileSync('data.md', 'utf8');

    // Converting data into HTML
    const md = new MarkdownIt();
    const htmlData = md.render(data);

    // Extracting Table From HTML
    const tables = htmlTableToJson.parse(htmlData).results; // array of all tables in the markdown

    if (!tables.length) {
        throw new Error('Error: no table found in the Markdown');
    }

    const validTables = tables.map((tab) => isValid(tab));

    // console.log('valid ->', validTables);
    if (!validTables.length) {
        throw new Error('Error: no valid table found');
    }
    // printing the first table
    // console.log(tables[0]);
    // console.log('File content:', data);
} catch (err) {
    console.error(err);
}
