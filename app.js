const fs = require('fs');
const slugify = require('slugify');
const MarkdownIt = require('markdown-it');
const htmlTableToJson = require('html-table-to-json');

const { AsciiTable3, AlignmentEnum } = require('ascii-table3');

// create table


const slug = (str) => slugify(str, {
    replacement: '_', // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: false, // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
});

const validData = (tab, index) => {
    const t = `raw ${index + 1}`;
    let eemes = '';

    if (tab.TaskName === '') eemes += `${t} col 2 : Task Name cannot be Empty .\n`;
    else if (Number(tab.TaskName)) eemes += `${t} col 2 : Task Name should be a String .\n`;

    if (!tab.QTY) eemes += `${t} col 4 :Quantity cannot be null and should a valid integer .\n`;
    else if (!Number.isInteger(tab.QTY)) eemes += `${t} col 4 :Quantity should be a Integer .\n`;
    else if (tab.QTY <= 0) eemes += `${t} col 4 :Quantity cannot be less than 0 .\n`;

    if (!tab.Price) eemes += `${t} col 5 : Price cannot be null and should be a valid Number .\n`;
    else if (tab.Price <= 0) eemes += `${t} col 5 : Price should be greater then 0 .\n`;

    return eemes;
};

const isValid = (tab) => {
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
    if (check.length) return { results: [], table: false };


    const tTemp = new AsciiTable3('Your table')
        .setHeading('No.', 'TaskName', 'TaskDescription', 'QTY', 'Price')
        .setAlign(5, AlignmentEnum.CENTER)
        .addRowMatrix(tabs.map((t, i) => [i + 1, t.task_name, t.task_description, t.price, t.qty]));

    // console.log(tTemp.toString());

    // creating final tables with Total attbr & valid data
    const errors = '';
    const results = tabs.map((t, index) => {
        const nt = {};
        nt.TaskName = t.task_name;
        nt.TaskDescription = t.task_description;
        nt.QTY = Number(t.qty);
        nt.Price = Number(t.price);
        nt.Total = nt.QTY * nt.Price;

        // console.log(validData(nt, index).error);
        const vdata = validData(nt, index);
        if (vdata.error) {
            errors.push(vdata.er);
            return null;
        }
        return nt;
    });

    // console.log(errors.toString());
    // const x = 'dd';
    // errors.forEach((q) => {
    //     // x.concat(q.TaskName);
    //     console.log(q.TaskName);
    // });
    // console.log(x.concat(errors[0].TaskName));

    return {
        results: results.filter((t) => t),
        table: tTemp.toString(),
        message: errors.length ? `${errors.length} row were eliminated ` : 'No Error found',
        errors,
    };
};


try {
    // cheking the file exits or not
    if (!fs.existsSync('data.md')) {
        throw new Error('Error: no such file exists or file is empty');
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

    let validTables = tables.map((tab) => (tab.length ? isValid(tab) : { results: [], errors: [] }));
    validTables = validTables.filter((tab) => (tab.results.length || tab.errors.length)); // removing the null values and empty tables
    // console.log(validTables.results);

    if (!validTables.length) {
        throw new Error('Error: no valid table found');
    }

    // printing the first valid table
    // console.log(validTables[0]);
} catch (err) {
    console.error(err);
}
