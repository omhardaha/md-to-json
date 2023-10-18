# Markdown to JSON Converter

## Description

The **Markdown to JSON Converter** is a versatile Node.js project that simplifies the process of transforming Markdown documents into structured JSON data. Markdown is a popular lightweight markup language used for creating plain text documents with easy-to-read formatting, while JSON (JavaScript Object Notation) is a widely adopted data interchange format. This project bridges the gap between the human-friendly Markdown and machine-readable JSON by providing a seamless conversion tool.

### Input

```
## Task Details

Here are the details of the tasks you need to complete:


| Task Name | Task Description       | QTY | Price |
| --------- | ---------------------- | --- | ----- |
| N_Task A    | Description for Task A | 5   | 10.00 |
| N_Task B    | Description for Task B | 8   | 7.50  |
|        f   | Description for Task C | 3   | 20.00 |
| N_Task D    | Description for Task D | 2   | 5.00  |
| N_Task E    | Description for Task E | 6   | 15.00 |

```

### Output

```
[{"TaskName":"N_Task A","TaskDescription":"Description for Task A","QTY":5,"Price":10,"Total":50},{"TaskName":"N_Task B","TaskDescription":"Description for Task B","QTY":8,"Price":7.5,"Total":60},{"TaskName":"f","TaskDescription":"Description for Task C","QTY":3,"Price":20,"Total":60},{"TaskName":"N_Task D","TaskDescription":"Description for Task D","QTY":2,"Price":5,"Total":10},{"TaskName":"N_Task E","TaskDescription":"Description for Task E","QTY":6,"Price":15,"Total":90}]
```

## Key Features

- **Markdown to JSON Conversion:** Easily convert Markdown documents into JSON format, making it suitable for use in various applications and systems.

- **Customizable Parsing:** The project offers customization options, allowing you to define how different Markdown elements should be translated into JSON objects. You can specify which Markdown tags correspond to which JSON keys.

- **Structured Output:** The JSON output maintains the hierarchical structure of your Markdown document, ensuring that the original organization and relationships between sections and content are preserved.

- **Command-Line Interface (CLI):** This project provides a user-friendly CLI that allows you to convert Markdown files with a simple command, making it suitable for both one-time conversions and batch processing.

- **API Integration:** Integrate the converter into your Node.js applications using the provided API. This enables seamless programmatic conversion of Markdown to JSON within your projects.

- **Error Handling:** The project includes robust error handling to alert you to any issues during the conversion process, making it easier to identify and address problems in your Markdown documents.

- **Extensible:** The project is highly extensible, allowing you to add custom logic and additional features as needed. You can easily adapt it to specific use cases or requirements.

## Use Cases

- **Data Extraction:** Convert Markdown documents into JSON for extracting structured information from unstructured content.

- **Documentation Management:** Automate the conversion of documentation written in Markdown for use in content management systems or APIs.

- **Content Migration:** Simplify the process of migrating content from Markdown-based platforms to JSON-based systems.

Whether you need to transform Markdown documents into JSON for data processing, content management, or any other purpose, the **Markdown to JSON Converter** provides a reliable and flexible solution, saving you time and effort while preserving the integrity of your content's structure.


