/**
 * Recursive function for building report. Function accepts report data in JSON and parent node (html tag) in which
 * report should be inserted
 * @param currentReport jsonb object with report data (one from array)
 * @param parentNode node in html-page
 * @returns {*}
 */

function buildReport(currentReport, parentNode, deep) {
    currentReport.sections.forEach(section => {
        let sectionHasNestedSections = ('sections' in section);
        let newSection = new BaseSection(section, deep).init();

        /** Recursive call for building nested sections if exists */
        if (sectionHasNestedSections) {
            deep++;
            buildReport(section, newSection, deep);
            deep--;
        }

        parentNode.appendChild(newSection);
    })

    return parentNode;
}

function addDescription(currentReport, parentNode) {
    if (currentReport.properties.description) {
        let description = `
            <h3>Description:</h3>
            <p>${currentReport.properties.description}</p>
        `;
        parentNode.insertAdjacentHTML('beforeend', description);
    }
    if (currentReport.properties.server_description) {
        let server_description = `
            <h3>Server description:</h3>
            <p>${currentReport.properties.server_description}</p>
        `;
        parentNode.insertAdjacentHTML('beforeend', server_description);
    }
}

function main() {
    /** Assuming data is now an array of reports */
    let report_id = 0;
    
    /** Build report sections */
    const CONTAINER = document.getElementById('container');
    
    /** We use the first report in the array */
    window.currentReport = data[report_id];
    
    addDescription(currentReport, CONTAINER);
    buildReport(currentReport, CONTAINER, 1);

    /** Add highlight feature */
    Highlighter.init();

    /** Add query text and plan feature */
    Previewer.init();

    /** Add menu feature */
    Menu.init();
}

main();