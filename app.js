const fs = require('fs');
const slugify = require('slugify');
const MarkdownIt = require('markdown-it');
const htmlTableToJson = require('html-table-to-json');


const slug = (str) => slugify(str, {
    replacement: '_', // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: false, // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
});

const validData = (tab) => {
    if (tab.task_name === '' || Number(tab.task_name)) return null;
    if (!tab.qty || !Number.isInteger(tab.qty) || tab.qty <= 0) return null;
    if (!tab.price || tab.price <= 0) return null;
    return tab;
};

const isValid = (tab) => {
    if (!tab.length) return [];

    const tabs = tab.map((t) => {
        const nt = {};

        Object.keys(t).forEach((key) => {
            nt[slug(key)] = t[key];
        });
        return nt;
    });

    // checking is all 4 are avail in array or not
    const shouldExistsKeys = ['task_name', 'task_description', 'qty', 'price'];
    const keys = Object.keys(tabs[0]);
    const check = keys.filter((k) => !shouldExistsKeys.includes(k));
    if (check.length) return [];


    // creating final tables with Total attr & valid data
    const finalTabs = tabs.map((t) => {
        const nt = {};
        nt.task_name = t.task_name;
        nt.task_description = t.task_description;
        nt.qty = Number(t.qty);
        nt.price = Number(t.price);
        nt.total = nt.qty * nt.price;
        return validData(nt);
    });

    // filtering the invalid data
    return finalTabs.filter((t) => t);
};


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

    let validTables = tables.map((tab) => isValid(tab));
    validTables = validTables.filter((tab) => (tab.length)); // removing the null values and empty tables

    // console.log('valid ->', validTables);
    if (!validTables.length) {
        throw new Error('Error: no valid table found');
    }

    console.log('cr', validTables);
    // printing the first valid table
    // console.log('File content:', data);
} catch (err) {
    console.error(err);
}
