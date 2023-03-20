let settings = input.config({
    title: "Convert URLs to attachments",
    description: `This app will download all attachments from the Attachment URLs Input field into the Attachment field. The input fields can be an URL field or any mixed text field containing one or multiple URLs. \n\n**IMPORTANT RULES:**\n\n 1. All attachment file MUST NOT have parentheses characters "(" and ")" in their names.\n 2. Pay attention to the View selection. Do not run this on the main grid view WITHOUT SELECTING the option to skip records that already have files in their attachment fields. It will then re-download every attachments for every records whether they are new or not, which can take a very long time to complete.`,
    items: [
        input.config.table("table", { label: "Table" 
        }),
        input.config.view("view", { 
            parentTable: "table",
            label: "View", 
        }),
        input.config.field("urlField1", {
            parentTable: "table",
            label: "Attachment URLs Input field 1",
        }),
        input.config.field("attachmentField1", {
            parentTable: "table",
            label: "Attachment field 1",
            description: "All attachment URLs from Input field 1 will be downloaded into this field",
        }),
        input.config.field("urlField2", {
            parentTable: "table",
            label: "Attachment URLs Input field 2",
        }),
        input.config.field("attachmentField2", {
            parentTable: "table",
            label: "Attachment field 2",
            description: "All attachment URLs from Input field 2 will be downloaded into this field",
        }),
        input.config.select("skipAlreadySet", {
            label: "Skip attachment entries that already have files?",
            options: [
                {label: "Yes, if a record already has attachments, do not update", value: "true" },
                {label: "No, replace all existing attachments with new ones", value: "false" }
            ]
        })
    ],
});

async function convertURLsToAttachments() {
    let { table, view, urlField1, attachmentField1, urlField2, attachmentField2, skipAlreadySet} = settings;

    if (attachmentField1.type !== "multipleAttachments") {
        output.text(
            `${attachmentField1.name} is not a Attachment field.\nRun the script again when you have an Attachment field.`
        );
        return;
    }

    if (attachmentField2.type !== "multipleAttachments") {
        output.text(
            `${attachmentField2.name} is not a Attachment field.\nRun the script again when you have an Attachment field.`
        );
        return;
    }

    let updatesSplashArt = [];
    for (let record of (
        await view.selectRecordsAsync({ fields: [urlField1, attachmentField1] })
    ).records) {
        let existingAttachments = record.getCellValue(attachmentField1) || [];
        if (JSON.parse(String(skipAlreadySet).toLowerCase()) && existingAttachments.length) continue;
        let urlsInputs = record.getCellValueAsString(urlField1);
        if (typeof urlsInputs !== "string") continue;
        let urls = urlsInputs.replace(/^(.*?)\(/, '').replace(/\)(.*?)\(/g, '\n').replace(/\)(.*?)/, '');
        let attachmentsFromUrls = urls.split("\n").map((url) => ({ url: url.trim() }));
        updatesSplashArt.push({
            id: record.id,
            fields: {
                [attachmentField1.id]: [
                    ...attachmentsFromUrls,
                ],
            },
        });
    }

    for (let i = 0; i < updatesSplashArt.length; i += 50) {
        await table.updateRecordsAsync(updatesSplashArt.slice(i, i + 50));
    }

    let updatesArtworks = [];
    for (let record of (
        await view.selectRecordsAsync({ fields: [urlField2, attachmentField2] })
    ).records) {
        let existingAttachments = record.getCellValue(attachmentField2) || [];
        if (JSON.parse(String(skipAlreadySet).toLowerCase()) && existingAttachments.length) continue;
        let urlsInputs = record.getCellValueAsString(urlField2);
        if (typeof urlsInputs !== "string") continue;
        let urls = urlsInputs.replace(/^(.*?)\(/, '').replace(/\)(.*?)\(/g, '\n').replace(/\)(.*?)/, '');
        let attachmentsFromUrls = urls.split("\n").map((url) => ({ url: url.trim() }));
        updatesArtworks.push({
            id: record.id,
            fields: {
                [attachmentField2.id]: [
                    ...attachmentsFromUrls,
                ],
            },
        });
    }

    for (let i = 0; i < updatesArtworks.length; i += 50) {
        await table.updateRecordsAsync(updatesArtworks.slice(i, i + 50));
    }
}
await convertURLsToAttachments();