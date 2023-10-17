import fs from 'fs';
import slugify from 'slugify';
import MarkdownIt from 'markdown-it';
import ora from 'ora';
import chalk from 'chalk';
import isHtml from 'is-html';
import htmlTableToJson from 'html-table-to-json';
import { AsciiTable3, AlignmentEnum } from 'ascii-table3';

const slug = (str) => slugify(str, {
    replacement: '_', // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: false, // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
});

const validData = (tab, i) => {
    const t = `row ${i + 1}`;
    let err = '';

    if (tab.TaskName === '') err = err.concat(`${t} Task Name : can't be Empty.\n`);
    else if (Number(tab.TaskName)) err = err.concat(`${t} Task Name : Task Name should be a String.\n`);

    if (!tab.QTY) err = err.concat(`${t} QTY : Quantity cannot be null and should a valid integer.\n`);
    else if (!Number.isInteger(tab.QTY)) err = err.concat(`${t} QTY : Quantity should be an Integer.\n`);
    else if (tab.QTY <= 0) err = err.concat(`${t} QTY : Quantity cannot be less than 0.\n`);

    if (!tab.Price) err = err.concat(`${t} Price : Price cannot be null and should be a valid Number.\n`);
    else if (tab.Price <= 0) err = err.concat(`${t} Price : Price should be greater then 0.\n`);

    // console.log(err);
    return err;
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
    if (check.length) return null;


    const tTemp = new AsciiTable3('Your table')
        .setHeading('No.', 'Task Name', 'Task Description', 'QTY', 'Price')
        .setAlign(5, AlignmentEnum.CENTER)
        .addRowMatrix(tabs.map((t, i) => [i + 1, t.task_name, t.task_description, t.qty, t.price]));

    // creating final tables with Total attbr & valid data
    let errors = '';
    let eraw = 0;
    const results = tabs.map((t, index) => {
        const nt = {};
        nt.TaskName = t.task_name;
        nt.TaskDescription = t.task_description;
        nt.QTY = Number(t.qty);
        nt.Price = Number(t.price);
        nt.Total = nt.QTY * nt.Price;

        // console.log(validData(nt, index).error);
        const vdata = validData(nt, index);
        // console.log(vdata);
        if (vdata !== '') {
            errors = errors.concat(vdata);
            // console.log(vdata);
            eraw += 1;
            return null;
        }
        return nt;
    });
    return {
        results: JSON.stringify(results.filter((t) => t)),
        message: ` ${tTemp.toString()}${eraw !== 0 ? `${eraw} rows eliminated.\n` : ''}${errors} \nJSON Data - ${JSON.stringify(results.filter((t) => t))}`,
        // errors,
    };
};


try {
    // cheking the file exits or not
    const spinner = ora('Check if File(data.md) Exists Or Not').start();
    if (!fs.existsSync('data.md')) {
        spinner.fail('Error: no such file exists');
        throw new Error('Error: no such file exists');
    }
    spinner.succeed();


    // reading the file
    spinner.start('Check if File is Empty');
    const data = fs.readFileSync('data.md', 'utf8');
    if (!data) {
        spinner.fail('Error: file is empty');
        throw new Error('Error: file is empty');
    }
    spinner.succeed();


    // Converting data into HTML
    spinner.start('Converting markdown into HTML');
    const md = new MarkdownIt();
    const htmlData = md.render(data);

    spinner.succeed();
    spinner.start('check if it is valid html');
    if (!isHtml(htmlData)) {
        spinner.fail('Error: invalid HTML');
        throw new Error('Error: invalid HTML');
    }
    spinner.succeed();

    // Extracting Table From HTML
    spinner.start('Extracting Tables into JSON From HTML');
    const tables = htmlTableToJson.parse(htmlData).results; // array of all tables in the markdown

    console.log(tables);
    if (!tables.length) {
        throw new Error('Error: no table found in the Markdown');
    }

    let validTables = tables.map((tab) => isValid(tab));
    validTables = validTables.filter((tab) => tab); // removing the null values and empty tables
    // console.log(validTables.results);

    if (!validTables.length) {
        throw new Error('Error: no valid table found');
    }

    // printing the first valid table
    console.log(validTables[0].message);
    spinner.stop();
} catch (err) {
    console.error(err);
}

