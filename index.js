const puppeteer = require('rebrowser-puppeteer');
const fs = require('fs');

async function run() {
    const browser = await puppeteer.launch({
        headless: true,
        // Using the pre-installed Chrome on GitHub's runner
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // THE LINK: exactly as you requested
    const url = "https://searxng.canine.tools/search?q=\"\"&format=json";
    const resultsFile = 'results.json';
    const readmeFile = 'readme.md';

    try {
        console.log(`Hitting ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Extracting raw text from the JSON response
        const content = await page.evaluate(() => document.body.innerText);
        
        // 1. Create results.json
        fs.writeFileSync(resultsFile, content);
        
        let resultCount = 0;
        try {
            const data = JSON.parse(content);
            resultCount = data.results ? data.results.length : 0;
        } catch (e) {
            console.log("Response wasn't valid JSON, but saving raw content anyway.");
        }
        
        // 2. Stats for readme.md
        const stats = fs.statSync(resultsFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(4);

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
        console.log("Stats updated. Deleting local results.json (IA step will handle the upload).");
        
        // Final cleanup as requested
        fs.unlinkSync(resultsFile);

    } catch (e) {
        console.error("Failed to fetch link:", e.message);
    } finally {
        await browser.close();
    }
}
run();        function updateOrAppend(content, label, newLine) {
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
