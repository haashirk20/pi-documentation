// split into 2 sections; gathering data and putting into mustache template

// step 1
// open up ecosystem.config.js, extract ip's (in this case: localhost), port, grab authToken from environment
// make API calls to all services, store into array and convert into json
// info to grab:
//   flows, node-red version, npm version, service name, documentation for each flow

// step 2
// open up json, place into mustache template

const fs = require('fs');
const axios = require('axios');
require('dotenv').config();
const Mustache = require('mustache');
const { exit } = require('process');

async function gatherServiceData(user, path) {
    let ecosystemConfig = '';
    try{
        ecosystemConfig = require(path);
    }
    catch(e){
        console.error("error finding ecosystem file");
        exit(144);
    }
    const services = ecosystemConfig.apps || [];
    const results = [];

    for (const service of services) {
        const ip = service.env?.IP || 'localhost';
        const port = service.env["PORT"];
        const authToken = service.env["TOKEN"];

        if (!port || !authToken) {
            console.warn(`Skipping ${service.name} due to missing port or token.`);
            continue;
        }

        try {
            const baseUrl = `http://${ip}:${port}`;
            const headers = { Authorization: `Bearer ${authToken}` };

            const [flowsRes, versionRes, nodeRes] = await Promise.all([
                axios.get(`${baseUrl}/flows`, { headers }),
                axios.get(`${baseUrl}/settings`, { headers }),
                axios.get(`${baseUrl}/diagnostics`, { headers })
            ]);

            const nodeVersion = nodeRes.data.nodejs.version;

            // Filter for 'tab' and 'subflow' types
            const description = flowsRes.data
                .filter(item => item.type === 'tab' || item.type === 'subflow')
                .map(item => {
                    return {
                        type: item.type,
                        label: item.label || item.name || 'Unnamed',
                        info: item.disabled ? 'Flow Disabled; See Flow for Details': item.info || '',
                        status: item.disabled ? 'Disabled' : 'Enabled',
                    };
                });

            results.push({
                name: service.name,
                ip,
                port,
                nodeRedVersion: versionRes.data?.version || 'unknown',
                nodeVersion,
                description
            });
        } catch (error) {
            console.error(`Failed to fetch data for ${service.name}:`, error.message);
        }
    }
    const username = user;
    const final = {username: username, results: results}
    fs.writeFileSync('serviceData.json', JSON.stringify(final, null, 2));
    return results;
}

function renderTemplate(user) {
    const template = fs.readFileSync('template.mustache', 'utf-8');
    const data = require("./serviceData.json");
    const output = Mustache.render(template, { username: data.username, services: data.results });
    fs.writeFileSync(`${user}.html`, output);
    console.log(`Rendered ${user}.html successfully.`);
}

(async () => {
    var args = process.argv.slice(2);
    var user = args[0]
    var path = args[1]
    await gatherServiceData(user, path);
    renderTemplate(user);
})();
