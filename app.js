import fs, { writeFileSync } from 'fs';
import slugify from 'slugify';
import MarkdownIt from 'markdown-it';
import ora from 'ora';
import chalk from 'chalk';
import isHtml from 'is-html';
import htmlTableToJson from 'html-table-to-json';
import { AsciiTable3, AlignmentEnum } from 'ascii-table3';

/**
 *
 * @param {string} str
 * @returns
 */
const slug = (str) => slugify(str, {
    replacement: '_', // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: false, // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
});

/**
 *
 * @param {*} tab
 * @param {number} i
 * @returns
 */

const validData = (tab, i) => {
    const t = `row ${i + 1}`;
    const err = [];

    if (tab.TaskName === '') err.push(`${t} Task Name : can't be Empty.\n`);
    if (tab.TaskName.length < 5 || tab.TaskName.length > 80) err.push(`${t} Task Name : Minimum 5 characters and Maximum 80 chracters Allowed.\n`);
    else if (Number(tab.TaskName)) err.push(`${t} Task Name : Task Name should be a text ex. MY_New_Task A34 ".\n`);

    if (tab.TaskDescription.length > 150) err.push(`${t} Task Description : Maximum 150 Allowed.\n`);

    if (!tab.QTY) err.push(`${t} QTY : Quantity can't be Empty and should a valid Digits.\n`);
    else if (!Number.isInteger(tab.QTY)) err.push(`${t} QTY : Quantity should be in Digits.\n`);
    else if (tab.QTY <= 0) err.push(`${t} QTY : Quantity cannot be less than 0.\n`);

    if (!tab.Price) err.push(`${t} Price : Price can't be Empty. and should be a valid Numbers.\n`);
    else if (tab.Price <= 0) err.push(`${t} Price : Price should be greater then 0.\n`);

    return err;
};

const isValid = (tab) => {
    // checking is all 4 are avail in array or not
    const shouldExistsKeys = ['task_name', 'task_description', 'qty', 'price'];
    const keys = Object.keys(tab[0]);
    const check = keys.filter((k) => !shouldExistsKeys.includes(k));
    return check.length === 0;
};

const asciiTable = (tabs) => {
    const originalKeys = Object.keys(tabs[0]);
    const slugKey = originalKeys.map((k) => slug(k));
    const keyMap = new Map();
    slugKey.forEach((s, i) => {
        keyMap[s] = originalKeys[i];
    });

    const tTemp = new AsciiTable3('Input table')
        .setHeading('No.', keyMap.task_name, keyMap.task_description, keyMap.qty, keyMap.price)
        .setAlign(5, AlignmentEnum.CENTER)
        .addRowMatrix(tabs.map((t, i) => [i + 1, t[keyMap.task_name], t[keyMap.task_description], t[keyMap.qty], t[keyMap.price]]));
    return tTemp.toString();
};

const checkDataErrors = (tabs) => {
    let errors = [];
    let eraw = 0;
    const results = tabs.map((t, index) => {
        const nt = {};
        nt.TaskName = t.task_name;
        nt.TaskDescription = t.task_description;
        nt.QTY = Number(t.qty);
        nt.Price = Number(t.price);
        nt.Total = nt.QTY * nt.Price;

        const vdata = validData(nt, index);
        if (vdata.length) {
            errors = errors.concat(vdata);
            eraw += 1;
            return null;
        }
        return nt;
    });
    return {
        results: JSON.stringify(results.filter((t) => t)),
        message: `${eraw !== 0 ? `${eraw} rows eliminated.\n` : ''}${errors.join('')} \n`,
    };
};


try {
    // cheking the file exits or not
    const spinner = ora('Check if File(data.md) Exists Or Not.').start();
    if (!fs.existsSync('data.md')) {
        spinner.fail('Error: no such file exists.');
        throw new Error('Error: no such file exists.');
    }
    spinner.succeed();

    // reading the file
    spinner.start('Check if File is Empty.');
    const data = fs.readFileSync('data.md', 'utf8');
    if (!data) {
        spinner.fail('Error: file is empty.');
        throw new Error('Error: file is empty.');
    }
    spinner.succeed();

    // Converting data into HTML
    spinner.start('Converting markdown into HTML.');
    const md = new MarkdownIt();
    const htmlData = md.render(data);

    spinner.succeed();
    spinner.start('Check if it is valid HTML.');
    if (!isHtml(htmlData)) {
        spinner.fail('Error: invalid HTML.');
        throw new Error('Error: invalid HTML.');
    }
    spinner.succeed();

    // Extracting Tables From HTML
    spinner.start('Extracting Tables into JSON From HTML.');
    const tables = htmlTableToJson.parse(htmlData).results; // array of all tables in the markdown
    spinner.succeed();

    spinner.start('Check if table found.');
    // console.log(tables);
    if (!tables.length) {
        spinner.fail('Error: no table found.');
        throw new Error('Error: no table found in the Markdown.');
    }
    spinner.succeed();
    spinner.start(`${tables.length} tables found.`);
    spinner.succeed();


    spinner.start('Removing invalid tables.');

    const slugTableTitle = tables.map((tab) => {
        const newTable = tab.map((t) => {
            const nt = {};

            Object.keys(t).forEach((key) => {
                nt[slug(key)] = t[key];
            });
            return nt;
        });
        return newTable;
    });
    const validTables = slugTableTitle.filter((tab) => isValid(tab)); // removing the null values and empty tables.
    spinner.succeed();
    // console.log(validTables.results);

    spinner.start('Check if any valid table left.');
    if (!validTables.length) {
        spinner.fail('Error: no valid table found');
        throw new Error('Error: no valid table found');
    }
    spinner.succeed();
    spinner.start('Picked First Table');
    spinner.succeed();

    console.log(asciiTable(validTables[0]));

    checkDataErrors(validTables[0]);
    // printing the first valid table
    spinner.start('Check if Data is valid.');
    spinner.succeed();

    spinner.start('Creating Output Dir if its not exist.');
    if (!fs.existsSync('./output')) {
        fs.mkdirSync('./output');
    }
    spinner.succeed();
    spinner.start('Creating Output File.');
    const currentDate = new Date();
    const opData = JSON.stringify(validTables[0], null, '\t');
    const fileName = `md-to-json-output-${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}-${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}-${currentDate.getMilliseconds()}.json`;
    try {
        writeFileSync(`./output/${fileName}`, opData, 'utf8');
    } catch (error) {
        spinner.fail(chalk.red('Failed to create file.'));
        console.log(error);
    }
    spinner.succeed();
    spinner.succeed(chalk.whiteBright('File has been created ') + chalk.green(`./output/${fileName}`));
    spinner.stop();
} catch (err) {
    console.error(err);
}

