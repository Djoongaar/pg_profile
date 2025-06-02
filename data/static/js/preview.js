/**
 * The class is designed to instantly preview the query text referenced by the selected row
 */
class Previewer {
    static getParentRows() {
        return document.querySelectorAll("table.preview tr:not(.header)");
    }

    static queryTextPreviewer(queryCell, queryRow, newRow, queryString) {
        queryCell.style.width = `${Math.floor(newRow.offsetWidth * 0.95)}px`;
        queryCell.style.fontFamily = 'Monospace';
        queryRow.style.display = '';

        /** Query text preview */
        if (!queryCell.hasChildNodes()) {
            let preprocessedText = Utilities.preprocessQueryString(queryString, 1000);
            queryCell.insertAdjacentHTML('afterbegin', `<p><i class="previewText">${preprocessedText}</i></p>`);
        }
    }

    static storageParamsPreviewer(previewCell, previewRow, newRow, previewData) {
        previewCell.style.width = `${Math.floor(newRow.offsetWidth * 0.95)}px`;
        previewCell.style.fontFamily = 'Monospace';
        previewRow.style.display = '';

        /** Query text preview */
        if (!previewCell.hasChildNodes()) {
            let topn = data.properties.topn || 20;
            previewData.slice(-topn).reverse().forEach(item => {
                let preprocessedText = Utilities.preprocessQueryString(`${item['first_seen']}: ${item['reloptions']}`, 1000);
                previewCell.insertAdjacentHTML('afterbegin', `<p><i>${preprocessedText}</i></p>`);
            })
        }
    }

    static findQuery(queryRaw) {
        // datasetName, dataID, parentRow.dataset[dataID]
        let datasetName = queryRaw.dataset["dataset_name"];
        let dataID = queryRaw.dataset["dataset_col_id"];
        let querySet = data.datasets[datasetName];
        let queryId = queryRaw.dataset["dataset_id"]
        
        for (let i = 0; i < querySet.length; i++) {
            if (querySet[i][dataID] === queryId) {
                return i
            }
        }
        return -1
    }

    static drawCopyButton() {
        let button = document.createElement('a');
        button.setAttribute('class', 'copyButton');
        button.setAttribute('title', 'Copy to clipboard');

        let svg = `
            <svg height="14px" width="12px" style="margin-left: 10px;">
                <rect x="2" y="2" height="12px" width="10px" rx="4" stroke="grey" fill="transparent"></rect>
                <rect x="0" y="0" height="12px" width="10px" rx="4" stroke="grey" fill="transparent"></rect>
            </svg>
        `

        button.insertAdjacentHTML('afterbegin', svg);

        return button;
    }

    static init() {
        const PARENT_ROWS = Previewer.getParentRows();

        PARENT_ROWS.forEach(parentRow => {

            /** Determine row and cell with query text */
            let previewCell = document.createElement("td");
            previewCell.setAttribute("colspan", "100");
            let previewRow = document.createElement("tr");
            previewRow.classList.add("previewRow");

            let preview = JSON.parse(parentRow.closest('table').dataset["preview"])[0]
            let sourceDatasetName = preview.dataset;
            let sourceDatasetKey = preview.id;

            previewRow.setAttribute("data-dataset_name", sourceDatasetName);
            previewRow.setAttribute("data-dataset_col_id", sourceDatasetKey);
            previewRow.setAttribute("data-dataset_id", parentRow.dataset[sourceDatasetKey]);
            previewRow.style.display = "none";
            previewRow.appendChild(previewCell);

            if (!parentRow.classList.contains("int1")) {
                parentRow.insertAdjacentElement("afterend", previewRow);
            }

            parentRow.addEventListener("click", event => {
                if (parentRow.classList.contains('int1')) {
                    previewRow = parentRow.nextSibling.nextSibling;
                    previewCell = previewRow.firstChild;
                }

                /** Trigger event only if user clicked not on rect and link*/
                if (event.target.tagName.toLowerCase() !== 'a' && event.target.tagName.toLowerCase() !== 'rect') {
                    if (previewRow.style.display === 'none') {
                        
                        /** Preview SQL query text */
                        if (sourceDatasetName === "queries" || sourceDatasetName === "act_queries") {
                            let queryIndex = Previewer.findQuery(previewRow);
                            if (queryIndex >= 0) {

                                let queryText = data.datasets[sourceDatasetName][queryIndex].query_texts[0];
                                Previewer.queryTextPreviewer(previewCell, previewRow, parentRow, queryText);

                                /** Copy query text into clipboard button */
                                let copyQueryTextButton = Previewer.drawCopyButton();
                                copyQueryTextButton.setAttribute("class", "copyQueryTextButton");
                                previewCell.appendChild(copyQueryTextButton);

                                copyQueryTextButton.addEventListener("click", event => {
                                    navigator.clipboard.writeText(queryText).then(r => console.log(queryText));
                                });
                            }
                        };

                        /** Preview Table storage parameters */
                        if (sourceDatasetName === "table_storage_parameters" || sourceDatasetName === "index_storage_parameters") {
                            let sourceDataset = data.datasets[sourceDatasetName]; 
                            let targetDatasetValue = parentRow.dataset[sourceDatasetKey];

                            let previewData = Utilities.find(sourceDataset, sourceDatasetKey, targetDatasetValue);

                            if (previewData.length) {
                                let previewDataJSON = JSON.stringify(previewData);
                                Previewer.storageParamsPreviewer(previewCell, previewRow, parentRow, previewData);
                            }
                        }
                    } else {
                        previewRow.style.display = 'none';
                    }
                }
            })
        })
    }
}