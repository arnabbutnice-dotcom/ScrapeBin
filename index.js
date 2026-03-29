const puppeteer = require('rebrowser-puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = "https://searxng.canine.tools/search?q=test&format=json";
    const resultsFile = 'results.json';
    const readmeFile = 'README.md';

    try {
        console.log("Fetching data...");
        await page.goto(url, { waitUntil: 'networkidle2' });
        const content = await page.evaluate(() => document.body.innerText);
        
        // 1. Save data to results.json
        fs.writeFileSync(resultsFile, content);
        const data = JSON.parse(content);
        
        // 2. Calculate stats
        const stats = fs.statSync(resultsFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        const resultCount = data.results ? data.results.length : 0;

        // 3. Update README.md
        let readmeContent = "";
        if (fs.existsSync(readmeFile)) {
            readmeContent = fs.readFileSync(readmeFile, 'utf8');
        }

        const sizeLine = `Size of the storage: ${fileSizeMB} MB`;
        const countLine = `No of results: ${resultCount}`;

        // Function to update or append the lines
        function updateLine(content, label, newLine) {
            const regex = new RegExp(`^${label}.*`, 'm');
            if (regex.test(content)) {
                return content.replace(regex, newLine);
            } else {
                return content.trim() + "\n\n" + newLine;
            }
        }

        readmeContent = updateLine(readmeContent, "Size of the storage:", sizeLine);
        // We re-check the updated content to append the second line correctly
        readmeContent = updateLine(readmeContent, "No of results:", countLine);

        fs.writeFileSync(readmeFile, readmeContent);
        console.log("README updated successfully.");

        // 4. Cleanup: Delete the results.json after work is done
        // (Wait! If you want to upload this to IA, don't delete it yet! 
        // The IA upload happens AFTER this script in the YAML. 
        // I will comment out the delete line so the IA step doesn't fail.)
        // fs.unlinkSync(resultsFile); 

    } catch (e) {
        console.error("Workflow Failed:", e.message);
    } finally {
        await browser.close();
    }
}

run();
