const puppeteer = require('rebrowser-puppeteer');
const fs = require('fs');

async function run() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote']
    });

    const page = await browser.newPage();
    const url = "https://searxng.canine.tools/search?q=test&format=json";
    const resultsFile = 'results.json';
    
    // Updated to lowercase to match your repo
    const readmeFile = 'readme.md';

    try {
        console.log("Connecting to SearXNG...");
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        const content = await page.evaluate(() => document.body.innerText);
        
        fs.writeFileSync(resultsFile, content);
        const data = JSON.parse(content);
        
        const stats = fs.statSync(resultsFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        const resultCount = data.results ? data.results.length : 0;

        // Ensure we find the file regardless of existence
        let readmeContent = fs.existsSync(readmeFile) ? fs.readFileSync(readmeFile, 'utf8') : "# ScrapeBin\n";

        const sizeLabel = "Size of the storage:";
        const countLabel = "No of results:";
        const newSizeLine = `${sizeLabel} ${fileSizeMB} MB`;
        const newCountLine = `${countLabel} ${resultCount}`;

        function updateOrAppend(content, label, newLine) {
            const regex = new RegExp(`^${label}.*`, 'm');
            if (regex.test(content)) {
                return content.replace(regex, newLine);
            } else {
                return content.trim() + "\n\n" + newLine;
            }
        }

        readmeContent = updateOrAppend(readmeContent, sizeLabel, newSizeLine);
        readmeContent = updateOrAppend(readmeContent, countLabel, newCountLine);

        fs.writeFileSync(readmeFile, readmeContent);
        console.log("readme.md updated.");

    } catch (e) {
        console.error("Workflow Error:", e.message);
    } finally {
        await browser.close();
    }
}
run();
